import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { requirePermissions, writeAuditLog } from '$lib/server/rbac';

export const load: PageServerLoad = async ({ locals, url }) => {
  const { data: companies } = await locals.supabase
    .from('companies')
    .select('*')
    .order('company_name');

  const selectedId = url.searchParams.get('id');
  let selectedCompany = null;
  let contacts: unknown[] = [];

  if (selectedId) {
    selectedCompany = companies?.find((c) => c.id === selectedId) ?? null;
    if (selectedCompany) {
      const { data } = await locals.supabase
        .from('contacts')
        .select('*')
        .eq('company_id', selectedId)
        .order('is_primary', { ascending: false });
      contacts = data ?? [];
    }
  }

  return { companies: companies ?? [], selectedCompany, contacts };
};

export const actions: Actions = {
  createCompany: async ({ request, locals }) => {
    requirePermissions(locals.permissions, ['companies.write']);
    const form = await request.formData();
    const company_name = (form.get('company_name') as string)?.trim();
    if (!company_name) return fail(400, { error: 'Company name is required' });

    const { data, error } = await locals.supabaseServiceRole
      .from('companies')
      .insert({
        company_name,
        location: (form.get('location') as string)?.trim() || '',
        hours: (form.get('hours') as string)?.trim() || '',
        phone: (form.get('phone') as string)?.trim() || '',
        company_type: (form.get('company_type') as string) || 'Other',
        employee_count: parseInt(form.get('employee_count') as string) || 0
      })
      .select()
      .single();

    if (error) return fail(500, { error: 'Failed to create company' });

    await writeAuditLog(locals.supabaseServiceRole, {
      actor_user_id: locals.user?.id ?? null,
      entity_type: 'company',
      entity_id: data.id,
      action: 'create',
      new_values: data as unknown as Record<string, unknown>
    });

    return { success: true };
  }
};
