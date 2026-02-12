import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import type { Cookies } from '@sveltejs/kit';
import {
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY
} from '$env/static/public';
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import type { Database } from '$lib/types';

/**
 * Creates a Supabase client scoped to the current user session.
 * Uses httpOnly cookies for token storage — no localStorage.
 */
export function createSupabaseServerClient(cookies: Cookies) {
  return createServerClient<Database>(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => cookies.getAll().map(({ name, value }) => ({ name, value })),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookies.set(name, value, {
              path: '/',
              httpOnly: true,
              secure: true,
              sameSite: 'lax',
              ...options
            });
          });
        }
      }
    }
  );
}

/**
 * Service role client — bypasses RLS.
 * ONLY use server-side for admin operations and audit logging.
 */
export function createSupabaseServiceClient() {
  return createClient<Database>(
    PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
}
