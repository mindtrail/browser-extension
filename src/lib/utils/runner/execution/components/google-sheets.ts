import { getTask } from '~/lib/supabase'
import { waitForUrl } from '~/lib/utils/runner/wait-for-url'

export async function googleSheetsComponent(props: RunnerComponentProps) {
  const { flowId, event, onEventStart, onEventEnd, task } = props
  await onEventStart({ flowId, event, taskId: task.id })

  try {
    const latestTask = await getTask(task.id)
    const updatedTask = latestTask.data || task

    const response = await fetch(
      `${process.env.PLASMO_PUBLIC_API_URL}/google-sheets/save`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sheetId: event.sheetId,
          values: updatedTask.state.variables[event.values],
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

    await onEventEnd({ event, taskId: task.id })
  } catch (error) {
    console.error('Error syncing to Google Sheet:', error)
    throw error
  }
}
