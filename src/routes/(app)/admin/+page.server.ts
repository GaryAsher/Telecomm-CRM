import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const supabase = locals.supabase;

  const [
    { data: roles },
    { count: callerCount },
    { count: interactionCount },
    { count: companyCount },
    { count: contactCount }
  ] = await Promise.all([
    supabase.from('roles').select('*').order('name'),
    supabase.from('callers').select('*', { count: 'exact', head: true }),
    supabase.from('interactions').select('*', { count: 'exact', head: true }),
    supabase.from('companies').select('*', { count: 'exact', head: true }),
    supabase.from('contacts').select('*', { count: 'exact', head: true })
  ]);

  return {
    roles: roles ?? [],
    stats: {
      callers: callerCount ?? 0,
      interactions: interactionCount ?? 0,
      companies: companyCount ?? 0,
      contacts: contactCount ?? 0
    }
  };
};
