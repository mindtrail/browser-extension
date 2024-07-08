import { useEffect, useCallback } from 'react'
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

  const onEventEnd = useCallback(async (props: OnEventEndProps) => {
    const updatedTask = await handleEventEnd(props)
    if (!updatedTask?.logs) return

    // console.log(111, updatedTask?.logs)
    setRunnerState(({ eventsCompleted, ...rest }) => {
      return {
        ...rest,
        eventsCompleted: [...updatedTask?.logs],
      }
    })
  }, [])

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

    setRunnerState(() => ({ tasksQueue, ...currentTask }))
  }, [tasksQueue])

  const endTaskRun = useCallback(
    async (status: TASK_STATUS = TASK_STATUS.COMPLETED) => {
      await endTask(runningTask, status)
      removeFromQueueAndResetRunner(runningTask.id)
    },
    [runningTask],
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
        onEventStart: handleEventStart,
        onEventEnd,
      })
    } catch (error) {
      console.log(222, error)
      incrementTaskRetries()
      return
    }

    // @TODO: make a check ... eventsCompleted === events length
    // console.log(333, retries, eventsCompleted)
    setTimeout(async () => {
      console.log(1234, runningTask)
      await endTaskRun()
    }, 2000)
  }, [runningFlow, eventsCompleted])

  // When the queue updates, process the first task
  useEffect(() => {
    // This should be triggered when removing from queue, but it does not
    console.log(4444, tasksQueue)
    if (!tasksQueue?.length || runningTask) return

    startTaskRun()
  }, [tasksQueue])

  useEffect(() => {
    if (!runningTask) return

    executeTaskEvents()
  }, [runningTask])

  // console.log(666, tasksQueue, runnerState.runningTask)

  return {
    runnerState,
    resetRunnerState,
    endTaskRun,
    addToQueue,
  }
}
