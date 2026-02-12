import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import { createSupabaseServiceClient } from '$lib/server/supabase';

/**
 * POST /api/webhooks/telephony
 *
 * Receives inbound call events from a telephony provider.
 * Upserts the caller record and creates an interaction.
 *
 * Security:
 * - Validates a shared secret in the Authorization header
 * - Uses service role client (bypasses RLS) since this is machine-to-machine
 * - Idempotent: uses normalized_phone as the unique key
 */
export const POST: RequestHandler = async ({ request }) => {
  // ─── 1. Authenticate the webhook ───
  // In production, verify the provider's signature (e.g., Twilio X-Twilio-Signature)
  const authHeader = request.headers.get('authorization');
  const expectedToken = `Bearer ${SUPABASE_SERVICE_ROLE_KEY.slice(0, 32)}`;

  if (authHeader !== expectedToken) {
    error(401, 'Unauthorized');
  }

  // ─── 2. Parse and validate payload ───
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    error(400, 'Invalid JSON');
  }

  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  const callerName = typeof body.caller_name === 'string' ? body.caller_name.trim() : null;
  const callSid = typeof body.call_sid === 'string' ? body.call_sid : null;

  if (!phone) {
    error(400, 'Missing required field: phone');
  }

  // Normalize phone: strip all non-digit characters
  const normalizedPhone = phone.replace(/\D/g, '');
  if (normalizedPhone.length < 7) {
    error(400, 'Invalid phone number');
  }

  const supabase = createSupabaseServiceClient();

  // ─── 3. Upsert caller by normalized phone ───
  const { data: caller, error: callerErr } = await supabase
    .from('callers')
    .upsert(
      {
        phone_number: phone,
        normalized_phone: normalizedPhone,
        full_name: callerName,
        status: 'new',
        reason: 'Inbound call'
      },
      { onConflict: 'normalized_phone', ignoreDuplicates: false }
    )
    .select()
    .single();

  if (callerErr) {
    console.error('Webhook: caller upsert failed', callerErr);
    error(500, 'Failed to process caller');
  }

  // ─── 4. Create interaction record ───
  const { data: interaction, error: interErr } = await supabase
    .from('interactions')
    .insert({
      caller_id: caller.id,
      interaction_type: 'call',
      direction: 'inbound',
      started_at: new Date().toISOString(),
      notes: callSid ? `Telephony call SID: ${callSid}` : null
    })
    .select()
    .single();

  if (interErr) {
    console.error('Webhook: interaction insert failed', interErr);
    error(500, 'Failed to create interaction');
  }

  // ─── 5. Audit log ───
  await supabase.from('audit_logs').insert({
    actor_user_id: null, // Machine-to-machine, no user actor
    entity_type: 'caller',
    entity_id: caller.id,
    action: 'webhook_inbound_call',
    new_values: { call_sid: callSid, phone: normalizedPhone }
  });

  return json(
    {
      success: true,
      caller_id: caller.id,
      interaction_id: interaction.id
    },
    { status: 200 }
  );
};
