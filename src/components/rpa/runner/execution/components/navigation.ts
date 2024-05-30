export async function navigationComponent({ flowId, event, onEventStart, onEventEnd }) {
  await onEventStart(flowId, event)
  await onEventEnd(flowId, event)
  window.location.href = event.value
}
