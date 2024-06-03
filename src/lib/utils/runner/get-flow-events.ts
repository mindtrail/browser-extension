export function getFlowEvents(flows, id) {
  return flows.find((flow) => flow.id === id)?.events || []
}
