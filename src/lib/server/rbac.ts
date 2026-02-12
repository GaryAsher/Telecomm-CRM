import type { SupabaseClient } from '@supabase/supabase-js';
import { error } from '@sveltejs/kit';
import type { Database } from '$lib/types';

/**
 * Fetches the effective permission keys for a user.
 * Uses the get_user_permissions() Postgres function.
 */
export async function getUserPermissions(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<string[]> {
  const { data, error: err } = await supabase
    .rpc('get_user_permissions', { user_uuid: userId });

  if (err) {
    console.error('Failed to fetch permissions:', err.message);
    return [];
  }

  return (data as string[]) ?? [];
}

/**
 * Asserts the user has ALL of the required permissions.
 * Throws a 403 if any are missing.
 */
export function requirePermissions(
  userPermissions: string[],
  required: string[]
): void {
  const missing = required.filter((p) => !userPermissions.includes(p));
  if (missing.length > 0) {
    error(403, {
      message: `Forbidden: missing permissions ${missing.join(', ')}`
    });
  }
}

/**
 * Checks if user has at least ONE of the given permissions.
 */
export function hasAnyPermission(
  userPermissions: string[],
  check: string[]
): boolean {
  return check.some((p) => userPermissions.includes(p));
}

/**
 * Writes an audit log entry (uses service role to bypass RLS).
 */
export async function writeAuditLog(
  serviceClient: SupabaseClient<Database>,
  entry: {
    actor_user_id: string | null;
    entity_type: string;
    entity_id: string;
    action: string;
    old_values?: Record<string, unknown> | null;
    new_values?: Record<string, unknown> | null;
  }
) {
  const { error: err } = await serviceClient
    .from('audit_logs')
    .insert({
      ...entry,
      occurred_at: new Date().toISOString()
    });

  if (err) {
    // Audit failures should not block operations, but must be logged
    console.error('Audit log write failed:', err.message);
  }
}
