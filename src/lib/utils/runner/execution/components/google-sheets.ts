import { getTask } from '~/lib/supabase'
import { waitForUrl } from '~/lib/utils/runner/wait-for-url'
import axios from 'axios'

export async function googleSheetsComponent({
  flowId,
  event,
  data,
  onEventStart,
  onEventEnd,
  task,
}) {
  await onEventStart(flowId, event)
  try {
    const taskRes = await getTask(task.id)
    task = taskRes.data

    const result = await axios.post('http://localhost:8000/google-sheets/save', {
      sheetId: event.sheetId,
      values: task.state.variables[event.values],
    })
    event.sheetId = result.data.sheetId
    event.baseURI = result.data.url

    const urlMatch = await waitForUrl(event.baseURI)
    if (!urlMatch) {
      window.location.href = event.baseURI
    }

    await onEventEnd(flowId, event)
  } catch (error) {
    console.error('Error syncing to Google Sheet:', error)
    throw error
  }
}
