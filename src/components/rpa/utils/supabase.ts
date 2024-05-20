import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.PLASMO_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.PLASMO_PUBLIC_SUPABASE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

export function onFlowsChange(onChange, channelName?: string) {
  const channel = supabase
    .channel(channelName || 'flows-channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'flows' }, onChange)
    .subscribe()
  return () => {
    channel.unsubscribe()
  }
}

export async function getFlows() {
  return supabase.from('flows').select('*').order('created_at', { ascending: true })
}

export async function createFlow(flow) {
  return supabase.from('flows').insert([flow]).select().single()
}

export async function deleteFlow(id) {
  return supabase.from('flows').delete().match({ id })
}

export async function updateFlow(id, flow) {
  return supabase.from('flows').update(flow).match({ id })
}

export function onTasksChange(onChange: (payload: any) => void, channelName?: string) {
  const channel = supabase
    .channel(channelName || 'tasks-channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, onChange)
    .subscribe()
  return () => {
    channel.unsubscribe()
  }
}

export async function getTasks() {
  return supabase.from('tasks').select('*').order('created_at', { ascending: true })
}

export async function getTask(id: string) {
  return supabase.from('tasks').select('*').match({ id }).single()
}

export async function createTask(task: any) {
  return supabase.from('tasks').insert([task]).select().single()
}

export async function deleteTask(id: string) {
  return supabase.from('tasks').delete().match({ id })
}

export async function updateTask(id: string, task: any) {
  return supabase.from('tasks').update(task).match({ id })
}
