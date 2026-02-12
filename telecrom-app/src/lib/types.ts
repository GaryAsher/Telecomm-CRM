// ═══════════════════════════════════════════════════════
// Domain types — mirrors the Supabase schema
// ═══════════════════════════════════════════════════════

export type CallerStatus = 'new' | 'in-progress' | 'follow-up' | 'escalated' | 'resolved';
export type InteractionType = 'call' | 'email' | 'note';
export type Direction = 'inbound' | 'outbound';

export interface Profile {
  id: string;
  email: string;
  display_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Company {
  id: string;
  company_name: string;
  location: string;
  hours: string;
  phone: string;
  company_type: string;
  employee_count: number;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  company_id: string;
  full_name: string;
  title: string;
  phone: string;
  email: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  company?: Company;
}

export interface Caller {
  id: string;
  phone_number: string;
  normalized_phone: string;
  full_name: string | null;
  account_reference: string | null;
  company_id: string | null;
  reason: string;
  status: CallerStatus;
  created_at: string;
  updated_at: string;
  // Joined fields
  company?: Company;
}

export interface Interaction {
  id: string;
  caller_id: string;
  assigned_user_id: string | null;
  interaction_type: InteractionType;
  direction: Direction;
  started_at: string | null;
  ended_at: string | null;
  duration_seconds: number | null;
  outcome: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  caller?: Caller;
}

export interface AuditLog {
  id: string;
  actor_user_id: string | null;
  entity_type: string;
  entity_id: string;
  action: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  occurred_at: string;
}

// ═══════════════════════════════════════════════════════
// Supabase generated Database type (simplified)
// For full type safety, use `supabase gen types typescript`
// ═══════════════════════════════════════════════════════

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      roles: { Row: Role; Insert: Partial<Role>; Update: Partial<Role> };
      companies: { Row: Company; Insert: Partial<Company>; Update: Partial<Company> };
      contacts: { Row: Contact; Insert: Partial<Contact>; Update: Partial<Contact> };
      callers: { Row: Caller; Insert: Partial<Caller>; Update: Partial<Caller> };
      interactions: { Row: Interaction; Insert: Partial<Interaction>; Update: Partial<Interaction> };
      audit_logs: { Row: AuditLog; Insert: Partial<AuditLog>; Update: Partial<AuditLog> };
    };
    Functions: {
      get_user_permissions: {
        Args: { user_uuid: string };
        Returns: string[];
      };
    };
  };
}

// ═══════════════════════════════════════════════════════
// UI / form types
// ═══════════════════════════════════════════════════════

export interface CallerFormData {
  full_name: string;
  phone_number: string;
  account_reference: string;
  company_id: string;
  reason: string;
}

export interface CompanyFormData {
  company_name: string;
  location: string;
  hours: string;
  phone: string;
  company_type: string;
  employee_count: number;
}

export interface ContactFormData {
  full_name: string;
  title: string;
  company_id: string;
  phone: string;
  email: string;
  is_primary: boolean;
}

export interface InteractionFormData {
  caller_id: string;
  interaction_type: InteractionType;
  direction: Direction;
  outcome: string;
  duration_seconds: number;
  notes: string;
}

// Status metadata for UI rendering
export const STATUS_CONFIG: Record<CallerStatus, { label: string; colorClass: string }> = {
  'new':         { label: 'New',         colorClass: 'status-new' },
  'in-progress': { label: 'In Progress', colorClass: 'status-in-progress' },
  'follow-up':   { label: 'Follow-up',   colorClass: 'status-follow-up' },
  'escalated':   { label: 'Escalated',   colorClass: 'status-escalated' },
  'resolved':    { label: 'Resolved',    colorClass: 'status-resolved' },
};
