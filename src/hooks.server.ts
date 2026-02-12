import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { createSupabaseServerClient, createSupabaseServiceClient } from '$lib/server/supabase';
import { getUserPermissions } from '$lib/server/rbac';

export const handle: Handle = async ({ event, resolve }) => {
  // ─── 1. Create Supabase clients ───
  event.locals.supabase = createSupabaseServerClient(event.cookies);
  event.locals.supabaseServiceRole = createSupabaseServiceClient();

  /**
   * Safe session getter — validates the JWT server-side.
   * Unlike getSession(), this calls getUser() to verify the token
   * isn't expired or tampered with.
   */
  event.locals.safeGetSession = async () => {
    const {
      data: { session }
    } = await event.locals.supabase.auth.getSession();

    if (!session) {
      return { session: null, user: null };
    }

    // Verify the JWT is still valid
    const {
      data: { user },
      error
    } = await event.locals.supabase.auth.getUser();

    if (error || !user) {
      return { session: null, user: null };
    }

    return { session, user };
  };

  // ─── 2. Load session + permissions for every request ───
  const { session, user } = await event.locals.safeGetSession();
  event.locals.session = session;
  event.locals.user = user;

  // Load permissions if authenticated
  if (user) {
    event.locals.permissions = await getUserPermissions(
      event.locals.supabaseServiceRole,
      user.id
    );
  } else {
    event.locals.permissions = [];
  }

  // ─── 3. Protect app routes ───
  // Everything under /(app) requires authentication
  const isAppRoute = event.url.pathname !== '/login' &&
                     !event.url.pathname.startsWith('/api/webhooks');

  if (isAppRoute && !session) {
    redirect(303, '/login');
  }

  // ─── 4. Security headers ───
  const response = await resolve(event, {
    filterSerializedResponseHeaders(name) {
      // Allow Supabase auth headers through
      return name === 'content-range' || name === 'x-supabase-api-version';
    }
  });

  // Apply security headers to all responses
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
};
