import { extractTable } from '../extract-table'
import { updateTask, getTask } from '~/lib/supabase'
import { waitForUrl } from '~/lib/utils/runner/wait-for-url'
import { waitForElement } from '~/lib/utils/runner/wait-for-element'

export async function extractComponent(props: RunnerComponentProps) {
  const { event, task } = props

  if (event.baseURI) {
    const urlMatch = await waitForUrl(event.baseURI)
    if (!urlMatch) {
      window.location.href = event.baseURI
    }
  }

  const element: any = await waitForElement(event.selector)
  if (!element) return

  await new Promise((resolve) => setTimeout(resolve, 2000))
  const entities = await extractTable(event.selector)

  const latestTask = await getTask(task.id)
  const updatedTask = latestTask.data || task

  await updateTask(task.id, {
    ...updatedTask,
    state: {
      ...task.state,
      variables: {
        ...task.variables,
        ...(entities && { entities }),
      },
    },
  })
}
