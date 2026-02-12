import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const supabase = locals.supabase;

  // Run queries in parallel for speed
  const [
    { count: activeCount },
    { count: escalatedCount },
    { count: resolvedCount },
    { count: companyCount },
    { data: recentCallers }
  ] = await Promise.all([
    supabase.from('callers').select('*', { count: 'exact', head: true }).neq('status', 'resolved'),
    supabase.from('callers').select('*', { count: 'exact', head: true }).eq('status', 'escalated'),
    supabase.from('callers').select('*', { count: 'exact', head: true }).eq('status', 'resolved'),
    supabase.from('companies').select('*', { count: 'exact', head: true }),
    supabase.from('callers')
      .select('id, full_name, reason, status')
      .neq('status', 'resolved')
      .order('created_at', { ascending: false })
      .limit(5)
  ]);

  return {
    stats: {
      active: activeCount ?? 0,
      escalated: escalatedCount ?? 0,
      resolved: resolvedCount ?? 0,
      companies: companyCount ?? 0
    },
    recentCallers: recentCallers ?? []
  };
};
