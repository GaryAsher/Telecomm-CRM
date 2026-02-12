import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { requirePermissions, writeAuditLog } from '$lib/server/rbac';

export const load: PageServerLoad = async ({ locals, url }) => {
  const supabase = locals.supabase;

  // Load callers with company name joined
  const { data: callers, error } = await supabase
    .from('callers')
    .select(`
      *,
      company:companies ( id, company_name )
    `)
    .order('created_at', { ascending: false });

  // If a caller is selected via URL param, load their interactions
  const selectedId = url.searchParams.get('id');
  let selectedCaller = null;
  let interactions: unknown[] = [];

  if (selectedId) {
    selectedCaller = callers?.find((c) => c.id === selectedId) ?? null;

    if (selectedCaller) {
      const { data } = await supabase
        .from('interactions')
        .select('*')
        .eq('caller_id', selectedId)
        .order('started_at', { ascending: false });
      interactions = data ?? [];
    }
  }

  // Load companies for the "new caller" form dropdown
  const { data: companies } = await supabase
    .from('companies')
    .select('id, company_name')
    .order('company_name');

  return {
    callers: callers ?? [],
    selectedCaller,
    interactions,
    companies: companies ?? []
  };
};

export const actions: Actions = {
  // Create a new caller
  createCaller: async ({ request, locals }) => {
    requirePermissions(locals.permissions, ['callers.write']);

    const form = await request.formData();
    const full_name = (form.get('full_name') as string)?.trim();
    const phone_number = (form.get('phone_number') as string)?.trim();
    const account_reference = (form.get('account_reference') as string)?.trim() || null;
    const company_id = (form.get('company_id') as string) || null;
    const reason = (form.get('reason') as string)?.trim() || '';

    if (!full_name || !phone_number) {
      return fail(400, { error: 'Name and phone number are required' });
    }

    // Normalize phone: strip non-digits
    const normalized_phone = phone_number.replace(/\D/g, '');

    const { data, error } = await locals.supabaseServiceRole
      .from('callers')
      .insert({
        full_name,
        phone_number,
        normalized_phone,
        account_reference,
        company_id,
        reason,
        status: 'new'
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return fail(400, { error: 'A caller with this phone number already exists' });
      }
      return fail(500, { error: 'Failed to create caller' });
    }

    await writeAuditLog(locals.supabaseServiceRole, {
      actor_user_id: locals.user?.id ?? null,
      entity_type: 'caller',
      entity_id: data.id,
      action: 'create',
      new_values: data as unknown as Record<string, unknown>
    });

    return { success: true };
  },

  // Update caller status
  updateStatus: async ({ request, locals }) => {
    requirePermissions(locals.permissions, ['callers.write']);

    const form = await request.formData();
    const caller_id = form.get('caller_id') as string;
    const status = form.get('status') as string;

    const validStatuses = ['new', 'in-progress', 'follow-up', 'escalated', 'resolved'];
    if (!caller_id || !validStatuses.includes(status)) {
      return fail(400, { error: 'Invalid status update' });
    }

    // Fetch old values for audit log
    const { data: old } = await locals.supabase
      .from('callers')
      .select('status')
      .eq('id', caller_id)
      .single();

    const { error } = await locals.supabaseServiceRole
      .from('callers')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', caller_id);

    if (error) {
      return fail(500, { error: 'Failed to update status' });
    }

    await writeAuditLog(locals.supabaseServiceRole, {
      actor_user_id: locals.user?.id ?? null,
      entity_type: 'caller',
      entity_id: caller_id,
      action: 'update_status',
      old_values: old as unknown as Record<string, unknown>,
      new_values: { status }
    });

    return { success: true };
  },

  // Log an interaction
  logInteraction: async ({ request, locals }) => {
    requirePermissions(locals.permissions, ['interactions.write']);

    const form = await request.formData();
    const caller_id = form.get('caller_id') as string;
    const interaction_type = form.get('interaction_type') as string;
    const direction = form.get('direction') as string;
    const outcome = (form.get('outcome') as string)?.trim() || null;
    const duration_seconds = parseInt(form.get('duration_seconds') as string) || null;
    const notes = (form.get('notes') as string)?.trim() || null;

    if (!caller_id || !interaction_type || !direction) {
      return fail(400, { error: 'Missing required fields' });
    }

    const { data, error } = await locals.supabaseServiceRole
      .from('interactions')
      .insert({
        caller_id,
        interaction_type,
        direction,
        outcome,
        duration_seconds,
        notes,
        assigned_user_id: locals.user?.id ?? null,
        created_by: locals.user?.id ?? null,
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return fail(500, { error: 'Failed to log interaction' });
    }

    await writeAuditLog(locals.supabaseServiceRole, {
      actor_user_id: locals.user?.id ?? null,
      entity_type: 'interaction',
      entity_id: data.id,
      action: 'create',
      new_values: data as unknown as Record<string, unknown>
    });

    return { success: true };
  }
};
