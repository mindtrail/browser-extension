import { useCallback, useEffect } from 'react'
import { Storage } from '@plasmohq/storage'
import { useStorage } from '@plasmohq/storage/hook'

import { STORAGE_AREA, DEFAULT_RUNNER_STATE } from '~/lib/constants'
import { getFlows, onFlowsChange, getTasks, deleteFlow, updateFlow } from '~/lib/supabase'
import { getFlowsToRun } from '~/components/rpa/runner/retrieval/get-flows-to-run'
import { runFlows } from '~/components/rpa/runner/execution/run-flows'
import { onTaskStart } from '~/components/rpa/runner/execution/on-task-start'
import { onEventStart } from '~/components/rpa/runner/execution/on-event-start'
import { onEventEnd } from '~/components/rpa/runner/execution/on-event-end'
import { onTaskEnd } from '~/components/rpa/runner/execution/on-task-end'

const RUNNER_CONFIG = {
  key: STORAGE_AREA.RUNNER,
  instance: new Storage({ area: 'local' }),
}

export const useRunnerState = () => {
  const [runnerState, setRunnerState] = useStorage(RUNNER_CONFIG, DEFAULT_RUNNER_STATE)

  const resetRunnerState = useCallback(() => setRunnerState(DEFAULT_RUNNER_STATE), [])

  useEffect(() => {
    const fetchFlows = async () => {
      const { data } = await getFlows()
      setRunnerState((prev) => ({ ...prev, flows: data }))
    }
    fetchFlows()
    const unsubscribe = onFlowsChange(fetchFlows, 'extension-flows-channel')
    return () => unsubscribe()
  }, [setRunnerState])

  useEffect(() => {
    const resumeTask = async () => {
      const { data } = await getTasks()
      const resumableTask = data.filter((task) => task.state.status !== 'ended')[0]

      if (resumableTask) {
        await runFlow(resumableTask.state.flowId, resumableTask)
      }
    }
    if (runnerState.flows.length > 0) resumeTask()
  }, [runnerState.flows])

  const runFlow = useCallback(
    async (flowId, task) => {
      const flowsToRun = await getFlowsToRun({
        flows: runnerState.flows,
        flowId,
        query: runnerState.query,
      })
      setRunnerState((prev) => ({
        ...prev,
        flowsRunning: flowsToRun.map((flow) => flow?.flowId),
      }))

      task = task || (await onTaskStart(flowId))
      await runFlows({
        task,
        flows: runnerState.flows,
        flowsToRun,
        query: runnerState.query,
        onEventStart: async (flowId, event) => {
          await onEventStart(flowId, event, task.id)
        },
        onEventEnd: async (flowId, event) => {
          await onEventEnd(flowId, event, task.id)
          setRunnerState((prev) => ({
            ...prev,
            eventsList: [...prev.eventsList, event],
          }))
        },
      })

      setTimeout(async () => {
        setRunnerState((prev) => ({
          ...DEFAULT_RUNNER_STATE,
          flows: prev.flows,
        }))
        await onTaskEnd(flowId, task.id)
      }, 2000)
    },
    [runnerState.flows, runnerState.query],
  )

  return {
    ...runnerState,
    setRunnerState,
    resetRunnerState,
    runFlow,
    updateFlow,
    deleteFlow,
  }
}
