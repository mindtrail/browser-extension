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
import { runFlows } from '~lib/utils/runner/execution/run-flows'

const RUNNER_CONFIG = {
  key: STORAGE_AREA.RUNNER,
  instance: new Storage({ area: 'local' }),
}

export const useRunnerState = () => {
  const [runnerState, setRunnerState] = useStorage(RUNNER_CONFIG, DEFAULT_RUNNER_STATE)
  const resetRunnerState = useCallback(() => setRunnerState(DEFAULT_RUNNER_STATE), [])

  const { flows, query } = runnerState

  useEffect(() => {
    const fetchFlows = async () => {
      const { data } = await getFlows()

      setRunnerState((prev) => ({ ...prev, flows: data }))
    }
    fetchFlows()
    const unsubscribe = onFlowsChange(fetchFlows)
    return () => unsubscribe()
  }, [setRunnerState])

  useEffect(() => {
    if (!flows) return

    const resumeTask = async () => {
      const { data } = await getTasks()
      const resumableTask = data.filter((task) => task.state.status !== 'ended')[0]

      if (resumableTask) {
        await runFlow(resumableTask.state.flowId, resumableTask)
      }
    }
    if (flows.length > 0) {
      resumeTask()
    }
  }, [flows])

  console.log(111, runnerState)

  const runFlow = useCallback(
    async (flowId: string, task) => {
      const flowsToRun = await getFlowsToRun({ flows, flowId, query })

      setRunnerState((prev) => ({
        ...prev,
        flowsRunning: flowsToRun.map((flow) => flow?.flowId),
      }))

      task = task || (await onTaskStart(flowId))
      await runFlows({
        flowId,
        task,
        flows,
        flowsToRun,
        query,
        onEventStart,
        onEventEnd: (props) => onEventEnd({ ...props, setRunnerState }),
      })

      setTimeout(async () => {
        setRunnerState((prev) => ({
          ...DEFAULT_RUNNER_STATE,
          flows: prev.flows,
        }))

        await onTaskEnd(task.id)
      }, 2000)
    },
    [runnerState.flows, runnerState.query, setRunnerState],
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

async function onTaskStart(flowId: string) {
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

async function onTaskEnd(taskId: string) {
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

async function onEventStart({ flowId, event, taskId }: OnEventStartProps) {
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

async function onEventEnd({ event, taskId, setRunnerState }: OnEventEndProps) {
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

  setRunnerState((prev) => {
    const eventExists = prev.eventsList.some((e) => e.id === event.id)
    if (eventExists) return prev

    return {
      ...prev,
      eventsList: [...prev.eventsList, event],
    }
  })
}
