export async function navigationComponent(props: RunnerComponentProps) {
  const { flowId, event, onEventStart, onEventEnd } = props

  await onEventStart({ flowId, event, taskId: event.id })
  await onEventEnd({ flowId, event, taskId: event.id })
  window.location.href = event.value
}
