export async function navigationComponent(props: RunnerComponentProps) {
  const { flowId, task, event, onEventStart, onEventEnd } = props

  await onEventStart({ flowId, event, taskId: task.id })
  await onEventEnd({ event, taskId: task.id })
  window.location.href = event.value
}
