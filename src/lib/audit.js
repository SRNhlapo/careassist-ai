import { supabase } from './supabase'

export const audit = (userId, action, type, id, outcome = 'success') =>
  supabase.from('audit_logs').insert({ user_id: userId, action, resource_type: type, resource_id: String(id), outcome })