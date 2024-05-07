import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.PLASMO_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.PLASMO_PUBLIC_SUPABASE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

export function onFlowsChange(onChange) {
  const channel = supabase
    .channel('custom-all-channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'flows' }, onChange)
    .subscribe()
  return () => {
    channel.unsubscribe()
  }
}

export async function getFlows() {
  return supabase.from('flows').select('*').order('created_at', { ascending: false })
}

export async function createFlow(flow) {
  return supabase.from('flows').insert([flow])
}

export async function deleteFlow(id) {
  return supabase.from('flows').delete().match({ id })
}

export async function updateFlow(id, flow) {
  return supabase.from('flows').update(flow).match({ id })
}
