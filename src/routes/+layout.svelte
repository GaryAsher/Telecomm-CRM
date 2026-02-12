<script lang="ts">
  import { onMount } from 'svelte';
  import { invalidate } from '$app/navigation';
  import { createBrowserClient } from '@supabase/ssr';
  import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
  import '../app.css';

  let { data, children } = $props();

  // Browser-side Supabase client (cookie-based, no localStorage)
  const supabase = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY);

  onMount(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, _session) => {
      // Re-run all load functions when auth state changes
      invalidate('supabase:auth');
    });

    return () => subscription.unsubscribe();
  });
</script>

{@render children()}
