import { useEffect, useCallback } from 'react'
import { Storage } from '@plasmohq/storage'
import { useStorage } from '@plasmohq/storage/hook'

import { STORAGE_AREA, DEFAULT_RUNNER_STATE } from '~/lib/constants'
import { endTask } from '~lib/utils/runner/execution/task-utils'
import { runEvents } from '~lib/utils/runner/execution/run-events'
import { buildFormData } from '~lib/utils/runner/build-form-data'
import { handleEventStart, handleEventEnd } from '~/lib/utils/runner/execution/task-utils'

const RUNNER_CONFIG = {
  key: STORAGE_AREA.RUNNER,
  instance: new Storage({ area: 'local' }),
}

export const useRunnerService = () => {
  const [runnerState, setRunnerState] = useStorage(RUNNER_CONFIG, DEFAULT_RUNNER_STATE)
  const { runQueue, runningTask, runningFlow, runningQuery, retries, eventsCompleted } =
    runnerState

  // Reset everything to default state, but keep the runQueue if neede
  const resetRunnerState = useCallback(
    (resetQueue = false) =>
      setRunnerState(({ runQueue }) => ({
        ...DEFAULT_RUNNER_STATE,
        runQueue: resetQueue ? [] : runQueue,
      })),
    [],
  )

  const addToQueue = useCallback((newTasks: any[]) => {
    setRunnerState(({ runQueue, ...rest }) => ({
      ...rest,
      runQueue: [
        ...runQueue,
        ...newTasks.filter(
          (newTask) => !runQueue.some(({ task }) => task.id === newTask.id),
        ),
      ],
    }))
  }, [])

  const removeFromQueue = useCallback((taskId: string) => {
    setRunnerState(({ runQueue, ...rest }) => ({
      ...rest,
      runQueue: runQueue.filter(({ task }) => task.id !== taskId),
    }))
  }, [])

  const onEventEnd = useCallback(async (props: OnEventEndProps) => {
    const updatedTask = await handleEventEnd(props)
    if (!updatedTask) return

    const { logs } = updatedTask

    setRunnerState(({ eventsCompleted, ...rest }) => {
      // const eventAlreadyMarked = prev?.eventsCompleted?.some((e) => e.id === newEvent.id)
      // if (eventAlreadyMarked) return prev
      // @TODO -> check when running after a refresh
      return {
        ...rest,
        eventsCompleted: [...logs],
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

  const endTaskRun = useCallback(
    async (status: 'ended' | 'failed' = 'ended') => {
      await endTask(runningTask, status)
      removeFromQueue(runningTask.id)
      resetRunnerState()
    },
    [runningTask],
  )

  // When the queue updates, process the first task
  useEffect(() => {
    if (runQueue?.length === 0) {
      resetRunnerState()
      return
    }

    if (!runningTask) {
      const { task, flow, query } = runQueue[0]

      // To manage the state + local storage more easily, everything is at the top level
      const taskToRun = {
        runningTask: task,
        runningFlow: flow,
        runningQuery: query,
        retries: 0,
        eventsCompleted: [],
      }

      setRunnerState((prev) => ({ ...prev, ...taskToRun }))
    }
  }, [runQueue])

  useEffect(() => {
    if (!runningTask) return

    // @TODO: if running & in progress... in step 1.2... etc

    const executeTaskEvents = async () => {
      console.log(111, retries)
      if (retries >= 3) {
        console.log(3333, 'failed')
        await endTaskRun('failed')
        return
      }

      try {
        // @TODO: Events from flow ... -> migrate to events from TASK with up to date state...
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
      setTimeout(async () => {
        await endTaskRun()
      }, 2000)
    }

    executeTaskEvents()
  }, [runningTask])

  return {
    runnerState,
    resetRunnerState,
    endTaskRun,
    addToQueue,
    removeFromQueue,
  }
}
