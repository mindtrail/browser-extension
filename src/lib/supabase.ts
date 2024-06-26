import { createClient } from '@supabase/supabase-js'
import { SUPABASE_CHANNELS } from '~/lib/constants'

const supabaseUrl = process.env.PLASMO_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.PLASMO_PUBLIC_SUPABASE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// Flows

export function onFlowsChange(onChange, channelName = SUPABASE_CHANNELS.FLOWS) {
  const channel = supabase
    .channel(channelName)
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

// Tasks

export function onTasksChange(
  onChange: (payload: any) => void,
  channelName = SUPABASE_CHANNELS.TASKS,
) {
  const channel = supabase
    .channel(channelName)
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

// Action Groups

export async function getActionGroupsByKeys(keys: string[]) {
  const res = await supabase.from('action_groups').select('key,actions').in('key', keys)
  return res.data || []
}

export async function getActionGroup(id: string) {
  return supabase.from('action_groups').select('*').match({ id }).single()
}

export async function createActionGroup(actionGroup: any) {
  return supabase.from('action_groups').insert([actionGroup]).select().single()
}

export async function deleteActionGroup(id: string) {
  return supabase.from('action_groups').delete().match({ id })
}

export async function updateActionGroup(id: string, actionGroup: any) {
  return supabase.from('action_groups').update(actionGroup).match({ id })
}
