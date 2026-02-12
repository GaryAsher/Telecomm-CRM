import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  // Count active (non-resolved) callers for the sidebar badge
  const { count } = await locals.supabase
    .from('callers')
    .select('*', { count: 'exact', head: true })
    .neq('status', 'resolved');

  return {
    queueCount: count ?? 0
  };
};
