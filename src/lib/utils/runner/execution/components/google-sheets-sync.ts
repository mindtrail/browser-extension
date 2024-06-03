import axios from 'axios'
import { getTask } from '~/lib/supabase'
import { waitForUrl } from '~/lib/utils/runner/wait-for-url'

export async function googleSheetsSyncComponent({
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
    await axios.post('http://localhost:8000/sync', task.state.variables['entities'])
    if (event.baseURI) {
      const urlMatch = await waitForUrl(event.baseURI)
      if (!urlMatch) {
        window.location.href = event.baseURI
      }
    }
    await onEventEnd(flowId, event)
  } catch (error) {
    console.error('Error syncing to Google Sheet:', error)
    throw error
  }
}
