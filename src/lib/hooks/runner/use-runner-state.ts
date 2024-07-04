import { useCallback, useEffect } from 'react'

import { getTasks } from '~/lib/supabase'

import { useRunnerService } from './use-runner-service'
import { useFlowService } from './use-flows-service'

export const useRunnerState = () => {
  const {
    runnerState,
    setRunnerState,
    resetRunnerState,
    flowsQueue,
    isProcessing,
    addToQueue,
  } = useRunnerService()

  const { query } = runnerState
  const { flows, updateFlow, deleteFlow } = useFlowService()

  const runFlow = useCallback(
    async (flowToRun: any) => {
      if (!flowToRun) return

      const queuedItem = {
        ...flowToRun,
        flowId: flowToRun.id,
        eventIds: flowToRun.events.map((event: any) => event.id),
        query,
      }

      addToQueue([queuedItem])
    },
    [flows, query],
  )

  useEffect(() => {
    if (!flows?.length) return

    const updateQueueWithResumableTasks = async () => {
      const { data = [] } = await getTasks()
      const resumableTasks = data.filter((task) => task?.state?.status !== 'ended')

      const flowsToResume = []
      for (const task of resumableTasks) {
        const flowToRun = flows.find((flow) => flow.id === task?.state?.flowId)
        if (!flowToRun) continue

        const alreadyInQueue = flowsQueue.some((item) => item.flowId === flowToRun.id)
        if (alreadyInQueue) continue

        const queuedItem = {
          ...flowToRun,
          flowId: flowToRun.id,
          eventIds: flowToRun.events.map((event: any) => event.id),
          query,
        }

        flowsToResume.push(queuedItem)
      }
      addToQueue(flowsToResume)
      console.log(3333, flowsToResume)
    }

    updateQueueWithResumableTasks()
  }, [flows])

  return {
    ...runnerState,
    flows,
    setRunnerState,
    resetRunnerState,
    runFlow,
    updateFlow,
    deleteFlow,
  }
}
