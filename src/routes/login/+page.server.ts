import type { Actions, PageServerLoad } from './$types';
import { redirect, fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
  // If already logged in, go to dashboard
  if (locals.session) {
    redirect(303, '/');
  }
  return {};
};

export const actions: Actions = {
  login: async ({ request, locals }) => {
    const formData = await request.formData();
    const email = (formData.get('email') as string)?.trim();
    const password = formData.get('password') as string;

    // Server-side validation
    if (!email || !password) {
      return fail(400, { error: 'Email and password are required', email });
    }

    const { error } = await locals.supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return fail(400, { error: 'Invalid email or password', email });
    }

    redirect(303, '/');
  },

  signup: async ({ request, locals }) => {
    const formData = await request.formData();
    const email = (formData.get('email') as string)?.trim();
    const password = formData.get('password') as string;
    const displayName = (formData.get('display_name') as string)?.trim();

    if (!email || !password || !displayName) {
      return fail(400, { error: 'All fields are required', email });
    }

    if (password.length < 8) {
      return fail(400, { error: 'Password must be at least 8 characters', email });
    }

    const { error } = await locals.supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName }
      }
    });

    if (error) {
      return fail(400, { error: error.message, email });
    }

    return { success: 'Check your email for a confirmation link.' };
  },

  logout: async ({ locals }) => {
    await locals.supabase.auth.signOut();
    redirect(303, '/login');
  }
};
