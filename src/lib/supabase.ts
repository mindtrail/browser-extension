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

export async function getTasksToRun() {
  return supabase
    .from('tasks')
    .select('*')
    .neq('state->>status', 'ended')
    .neq('state->>status', 'failed')
    .order('created_at', { ascending: true })
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

// Assistants

export async function getAssistants() {
  return supabase.from('assistants').select('*').order('created_at', { ascending: true })
}

export async function getLastAssistant() {
  const res = await supabase
    .from('assistants')
    .select('*')
    .order('created_at', { ascending: false })
    .single()
  return res.data
}

export async function getAssistant(id: string) {
  return supabase.from('assistants').select('*').match({ id }).single()
}

export async function createAssistant(assistant: any) {
  return supabase.from('assistants').insert([assistant]).select().single()
}

export async function deleteAssistant(id: string) {
  return supabase.from('assistants').delete().match({ id })
}

export async function updateAssistant(id: string, assistant: any) {
  return supabase.from('assistants').update(assistant).match({ id })
}

// Threads

export function onThreadsChange(
  onChange: (payload: any) => void,
  channelName = SUPABASE_CHANNELS.THREADS,
) {
  const channel = supabase
    .channel(channelName)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'threads' }, onChange)
    .subscribe()
  return () => {
    channel.unsubscribe()
  }
}

export async function getThreads() {
  return supabase.from('threads').select('*').order('created_at', { ascending: true })
}

export async function getLastThread() {
  const res = await supabase
    .from('threads')
    .select('*')
    .order('created_at', { ascending: false })
    .single()
  return res.data
}

export async function getThread(id: string) {
  return supabase.from('threads').select('*').match({ id }).single()
}

export async function createThread(thread: any) {
  return supabase.from('threads').insert([thread]).select().single()
}

export async function deleteThread(id: string) {
  return supabase.from('threads').delete().match({ id })
}

export async function updateThread(id: string, thread: any) {
  return supabase.from('threads').update(thread).match({ id })
}
