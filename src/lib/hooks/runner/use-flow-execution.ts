import { useCallback } from 'react'
import { runFlows } from '~lib/utils/runner/execution/run-flows'

export const useFlowExecution = () => {
  const executeFlow = useCallback(async (flow, onEventStart, onEventEnd) => {
    await runFlows({
      flowId: flow.flowId,
      task: flow.task,
      flows: [flow],
      flowsToRun: [flow],
      query: '',
      onEventStart,
      onEventEnd,
    })
  }, [])

  return { executeFlow }
}
