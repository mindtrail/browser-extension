const delay = 1000

export async function urlComponent({ flowId, event, data, onEventStart, onEventEnd }) {
  await onEventStart(flowId, event)
  await new Promise((resolve) => setTimeout(resolve, delay))
  await onEventEnd(flowId, event)
  window.location.href = event.url
  await new Promise((resolve) => setTimeout(resolve, 10 * delay))
}
