import { useCallback, useEffect } from 'react'
import { Storage } from '@plasmohq/storage'
import { useStorage } from '@plasmohq/storage/hook'

import { STORAGE_AREA, DEFAULT_RUNNER_STATE } from '~/lib/constants'
import {
  getFlows,
  onFlowsChange,
  getTasks,
  deleteFlow,
  updateFlow,
  createTask,
  getTask,
  updateTask,
  getLastThread,
} from '~/lib/supabase'
import { getFlowsToRun } from '~lib/utils/runner/retrieval/get-flows-to-run'
import { runFlowEvents } from '~lib/utils/runner/execution/run-flows'

const RUNNER_CONFIG = {
  key: STORAGE_AREA.RUNNER,
  instance: new Storage({ area: 'local' }),
}

async function onTaskStart(flowId) {
  const thread = await getLastThread()
  const newTaskRes = await createTask({
    state: {
      status: 'started',
      variables: thread.data,
      flowId,
    },
    logs: [],
  })
  return newTaskRes.data
}

async function onTaskEnd(flowId, taskId) {
  const taskRes = await getTask(taskId)
  const task: any = taskRes.data

  // Update task state to 'ended' if all events are ended
  const logs = task.logs || []
  const lastLog = logs[logs.length - 1]
  if (lastLog && lastLog.status === 'ended') {
    return updateTask(task.id, {
      ...task,
      state: {
        ...task.state,
        status: 'ended',
      },
    })
  }

  return task
}

async function onEventStart(flowId, event, taskId) {
  const taskRes = await getTask(taskId)
  const task: any = taskRes.data

  // Check if the eventId already exists in the logs
  const eventExists = task.logs.some((log) => log.eventId === event.id)

  // Only add the log if the eventId does not exist
  if (!eventExists) {
    await updateTask(task.id, {
      ...task,
      state: {
        ...task.state,
        status: 'running',
      },
      logs: [
        ...task.logs,
        {
          flowId,
          eventId: event.id,
          status: 'running',
        },
      ],
    })
  }
}

async function onEventEnd(flowId, event, taskId) {
  const taskRes = await getTask(taskId)
  const task: any = taskRes.data
  await updateTask(task.id, {
    ...task,
    state: {
      ...task.state,
      status: 'running',
    },
    logs: task.logs.map((log) => {
      if (log.eventId === event.id) {
        return {
          ...log,
          status: 'ended',
        }
      }
      return log
    }),
  })
}

export const useRunnerState = () => {
  const [runnerState, setRunnerState] = useStorage(RUNNER_CONFIG, DEFAULT_RUNNER_STATE)
  const resetRunnerState = useCallback(() => setRunnerState(DEFAULT_RUNNER_STATE), [])

  console.log(4444, runnerState)

  useEffect(() => {
    const fetchFlows = async () => {
      const { data } = await getFlows()
      console.log(111, data)

      setRunnerState((prev) => ({ ...prev, flows: data }))
    }
    fetchFlows()
    const unsubscribe = onFlowsChange(fetchFlows)
    return () => unsubscribe()
  }, [setRunnerState])

  useEffect(() => {
    if (!runnerState.flows) return

    const resumeTask = async () => {
      const { data } = await getTasks()
      const resumableTask = data.filter((task) => task.state.status !== 'ended')[0]

      if (resumableTask) {
        await runFlow(resumableTask.state.flowId, resumableTask)
      }
    }
    if (runnerState.flows.length > 0) {
      resumeTask()
    }
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
        eventsList: flowsToRun.map((flow) => flow?.events).flat(),
      }))

      console.log(111, flowsToRun)

      task = task || (await onTaskStart(flowId))
      await runFlowEvents({
        task,
        flows: runnerState.flows,
        flowsToRun,
        query: runnerState.query,
        onEventStart: async (flowId, event) => {
          await onEventStart(flowId, event, task.id)
        },
        onEventEnd: async (flowId, event) => {
          await onEventEnd(flowId, event, task.id)
          setRunnerState((prev) => {
            const eventExists = prev.eventsList.some((e) => e.id === event.id)
            if (eventExists) return prev
            return {
              ...prev,
              eventsList: [...prev.eventsList, event],
            }
          })
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
