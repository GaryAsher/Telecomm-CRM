// See https://kit.svelte.dev/docs/types#app
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '$lib/types';

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>;
      supabaseServiceRole: SupabaseClient<Database>;
      safeGetSession: () => Promise<{
        session: Session | null;
        user: import('@supabase/supabase-js').User | null;
      }>;
      session: Session | null;
      user: import('@supabase/supabase-js').User | null;
      permissions: string[];
    }
    interface PageData {
      session: Session | null;
      user: import('@supabase/supabase-js').User | null;
      permissions: string[];
    }
  }
}

export {};
