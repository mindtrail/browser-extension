import { createClient } from '@supabase/supabase-js'
import { SUPABASE_CHANNELS } from '~/lib/constants'
import { TASK_STATUS } from '~/lib/constants'

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
    .neq('state->>status', TASK_STATUS.COMPLETED)
    .neq('state->>status', TASK_STATUS.FAILED)
    .neq('state->>status', TASK_STATUS.STOPPED)
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

// Actions Store

export function onActionsStoreChange(
  onChange: (payload: any) => void,
  channelName = SUPABASE_CHANNELS.ACTIONS_STORE,
) {
  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'actions_store' },
      onChange,
    )
    .subscribe()
  return () => {
    channel.unsubscribe()
  }
}

export async function getActionsStore() {
  const res = await supabase
    .from('actions_store')
    .select('*')
    .order('created_at', { ascending: true })
  return res.data || []
}

export async function getActionsStoreByKeys(keys: string[]) {
  const res = await supabase.from('actions_store').select('key,actions').in('key', keys)
  return res.data || []
}

export async function getActionsStoreById(id: string) {
  return supabase.from('actions_store').select('*').match({ id }).single()
}

export async function createActionsStore(actionsStore: any) {
  return supabase.from('actions_store').insert([actionsStore]).select().single()
}

export async function deleteActionsStore(id: string) {
  return supabase.from('actions_store').delete().match({ id })
}

export async function updateActionsStore(id: string, actionsStore: any) {
  return supabase.from('actions_store').update(actionsStore).match({ id })
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
