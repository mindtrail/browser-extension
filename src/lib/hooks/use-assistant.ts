import { useEffect, useState, useCallback } from 'react'
import OpenAI from 'openai'
import {
  createAssistant,
  getLastAssistant,
  getLastThread,
  createThread,
  updateThread,
} from '~lib/supabase'

const openai = new OpenAI({
  apiKey: process.env.PLASMO_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
})

export const useAssistant = () => {
  const [assistantResponse, setAssistantResponse] = useState<string>('')
  const [assistantStatus, setAssistantStatus] = useState<string>('')
  const [assistantId, setAssistantId] = useState<string>('')
  const [threadId, setThreadId] = useState<string>('')

  useEffect(() => {
    const initialize = async () => {
      await initAssistant()
      await initThread()
    }
    initialize()
  }, [])

  async function initAssistant() {
    let assistant = await getLastAssistant()
    if (!assistant) {
      assistant = await openai.beta.assistants.create({
        name: 'Workflow Assistant',
        model: 'gpt-4o',
        tools: [{ type: 'file_search' }],
      })
      await createAssistant({
        id: assistant.id,
        data: {},
      })
    }
    // console.log('assistant', assistant)
    setAssistantId(assistant.id)
  }

  async function initThread() {
    let thread = await getLastThread()
    if (!thread) {
      thread = await openai.beta.threads.create()
      await createThread({
        id: thread.id,
        messages: [],
        data: {},
      })
    }
    // console.log('thread', thread)
    setThreadId(thread.id)
  }

  const uploadFile = useCallback(
    async (file) => {
      setAssistantStatus('file_upload_pending')
      const { id: file_id } = await openai.files.create({
        file,
        purpose: 'assistants',
      })
      const message = await openai.beta.threads.messages.create(threadId, {
        role: 'user',
        content:
          'Extract information from this file. Response should be in JSON format. Only respond with JSON with no additional text.',
        attachments: [{ file_id, tools: [{ type: 'file_search' }] }],
      })
      setAssistantStatus('file_upload_completed')
      return message
    },
    [threadId],
  )

  const parseFile = useCallback(async () => {
    setAssistantStatus('file_parsing_pending')
    let run = await openai.beta.threads.runs.createAndPoll(threadId, {
      assistant_id: assistantId,
    })
    if (run.status === 'completed') {
      const messages: any = await openai.beta.threads.messages.list(run.thread_id)
      const lastMessage = messages.data[0]
      const data = parseJsonString(lastMessage.content[0].text.value)
      setAssistantResponse(data)
      await updateThread(run.thread_id, { data })
      setAssistantStatus('file_parsing_completed')
    }
  }, [assistantId, threadId])

  return { assistantResponse, parseFile, uploadFile, assistantStatus }
}

// Extract the JSON string from the text block and then parse it
function parseJsonString(value) {
  const jsonStart = value.indexOf('```json')
  const jsonEnd = value.lastIndexOf('```')
  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
    const cleanedJsonString = value.substring(jsonStart + 7, jsonEnd).trim()
    return JSON.parse(cleanedJsonString)
  }
}
