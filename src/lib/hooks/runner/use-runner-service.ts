import { useEffect, useCallback, useRef } from 'react'
import { Storage } from '@plasmohq/storage'
import { useStorage } from '@plasmohq/storage/hook'

import { STORAGE_AREA, DEFAULT_RUNNER_STATE } from '~/lib/constants'
import { endTask } from '~lib/utils/runner/execution/task-utils'
import { runEvents } from '~lib/utils/runner/execution/run-events'
import { buildFormData } from '~lib/utils/runner/build-form-data'
import { handleEventStart, handleEventEnd } from '~/lib/utils/runner/execution/task-utils'
import { TASK_STATUS } from '~/lib/constants'

const RUNNER_CONFIG = {
  key: STORAGE_AREA.RUNNER,
  instance: new Storage({ area: 'local' }),
}

export const useRunnerService = () => {
  const taskAbortRef = useRef({ wasStopped: false })

  const [runnerState, setRunnerState] = useStorage(RUNNER_CONFIG, DEFAULT_RUNNER_STATE)
  const { tasksQueue, runningTask, runningFlow, retries, eventsCompleted } = runnerState

  const resetRunnerState = () => setRunnerState(() => ({ ...DEFAULT_RUNNER_STATE }))

  const addToQueue = useCallback((newTasks: any[]) => {
    setRunnerState(({ tasksQueue, ...prevState }) => ({
      ...prevState,
      tasksQueue: [
        ...tasksQueue,
        ...newTasks.filter(
          (newTask) => !tasksQueue.some(({ task }) => task.id === newTask.id),
        ),
      ],
    }))
  }, [])

  const removeFromQueueAndResetRunner = useCallback((taskId: string) => {
    setRunnerState(({ tasksQueue }) => {
      return {
        ...DEFAULT_RUNNER_STATE,
        tasksQueue: [...tasksQueue.filter(({ task }) => task.id !== taskId)],
      }
    })
  }, [])

  const onEventEnd = useCallback(
    async (props: OnEventEndProps) => {
      const updatedTask = await handleEventEnd(props)
      if (!updatedTask?.logs) return

      console.log(1233333, updatedTask)
      setRunnerState(({ eventsCompleted, ...rest }) => {
        return {
          ...rest,
          eventsCompleted: [...updatedTask?.logs],
        }
      })
    },
    [runningTask],
  )

  const incrementTaskRetries = useCallback(
    () =>
      setRunnerState(({ retries, ...rest }) => ({
        ...rest,
        retries: (retries || 0) + 1,
      })),
    [],
  )

  const startTaskRun = useCallback(() => {
    const { task, flow, query } = tasksQueue[0]
    // To manage the state + local storage more easily, everything is at the top level
    const currentTask = {
      runningTask: task,
      runningFlow: flow,
      runningQuery: query,
      retries: 0,
      eventsCompleted: task?.logs || [],
    }

    taskAbortRef.current.wasStopped = false
    setRunnerState(() => ({ tasksQueue, ...currentTask }))
  }, [tasksQueue])

  const endTaskRun = useCallback(
    async (status: TASK_STATUS = TASK_STATUS.COMPLETED) => {
      if (status === TASK_STATUS.STOPPED) {
        taskAbortRef.current.wasStopped = true
      }

      await endTask(runningTask, status)
      removeFromQueueAndResetRunner(runningTask.id)
      taskAbortRef.current.wasStopped = false
    },
    [runningTask, eventsCompleted],
  )

  const executeTaskEvents = useCallback(async () => {
    if (retries >= 3) {
      await endTaskRun(TASK_STATUS.FAILED)
      return
    }

    try {
      const data = await buildFormData({
        variables: runningTask?.state?.variables,
        events: runningFlow.events,
      })

      await runEvents({
        task: runningTask,
        flowId: runningFlow.id,
        events: runningFlow.events,
        data, // @TODO -> we need a better name for this
        abortSignal: taskAbortRef.current,
        onEventStart: handleEventStart,
        onEventEnd,
      })
    } catch (error) {
      console.log(222, error)
      incrementTaskRetries()
    }
  }, [runningFlow, retries, eventsCompleted])

  useEffect(() => {
    if (!tasksQueue?.length || runningTask) return
    startTaskRun()
  }, [tasksQueue])

  useEffect(() => {
    if (!runningTask) return
    executeTaskEvents()
  }, [runningTask, retries])

  useEffect(() => {
    if (
      eventsCompleted?.length &&
      runningFlow?.events &&
      eventsCompleted?.length === runningFlow?.events?.length &&
      eventsCompleted[eventsCompleted.length - 1]?.status === TASK_STATUS.COMPLETED
    ) {
      console.log(1234, runningTask)
      setTimeout(async () => {
        endTaskRun()
      }, 1500)
    }
  }, [eventsCompleted, runningFlow])

  return {
    runnerState,
    resetRunnerState,
    endTaskRun,
    addToQueue,
  }
}
