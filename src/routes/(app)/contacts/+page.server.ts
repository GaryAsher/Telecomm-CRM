import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { requirePermissions, writeAuditLog } from '$lib/server/rbac';

export const load: PageServerLoad = async ({ locals }) => {
  const { data: contacts } = await locals.supabase
    .from('contacts')
    .select('*, company:companies ( id, company_name )')
    .order('full_name');

  const { data: companies } = await locals.supabase
    .from('companies')
    .select('id, company_name')
    .order('company_name');

  return { contacts: contacts ?? [], companies: companies ?? [] };
};

export const actions: Actions = {
  createContact: async ({ request, locals }) => {
    requirePermissions(locals.permissions, ['contacts.write']);
    const form = await request.formData();
    const full_name = (form.get('full_name') as string)?.trim();
    if (!full_name) return fail(400, { error: 'Name is required' });

    const { data, error } = await locals.supabaseServiceRole
      .from('contacts')
      .insert({
        full_name,
        title: (form.get('title') as string)?.trim() || '',
        company_id: form.get('company_id') as string,
        phone: (form.get('phone') as string)?.trim() || '',
        email: (form.get('email') as string)?.trim() || '',
        is_primary: form.get('is_primary') === 'on'
      })
      .select()
      .single();

    if (error) return fail(500, { error: 'Failed to create contact' });

    await writeAuditLog(locals.supabaseServiceRole, {
      actor_user_id: locals.user?.id ?? null,
      entity_type: 'contact',
      entity_id: data.id,
      action: 'create',
      new_values: data as unknown as Record<string, unknown>
    });

    return { success: true };
  }
};
