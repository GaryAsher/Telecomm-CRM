import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  const { data: interactions } = await locals.supabase
    .from('interactions')
    .select('*, caller:callers ( id, full_name )')
    .order('started_at', { ascending: false })
    .limit(200);

  return { interactions: interactions ?? [] };
};
