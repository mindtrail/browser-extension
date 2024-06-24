import { getTask } from '~/lib/supabase'
import { waitForUrl } from '~/lib/utils/runner/wait-for-url'

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

    const response = await fetch(
      `${process.env.PLASMO_PUBLIC_API_URL}/google-sheets/save`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sheetId: event.sheetId,
          values: task.state.variables[event.values],
        }),
      },
    )
    const result = await response.json()
    event.sheetId = result.sheetId
    event.baseURI = result.url

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
