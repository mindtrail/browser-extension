import { useEffect, useCallback, useState } from 'react'
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
  const { runQueue, runningTask } = runnerState

  const { task } = runningTask

  const resetRunnerState = useCallback(() => setRunnerState(DEFAULT_RUNNER_STATE), [])

  const addToQueue = useCallback((newFlows: any[]) => {
    setRunnerState((prev) => ({
      ...prev,
      runQueue: [
        ...prev.runQueue,
        ...newFlows.filter(
          (flow) => !prev.runQueue.some((queuedFlow) => queuedFlow.id === flow.id),
        ),
      ],
    }))
  }, [])

  const removeFromQueue = useCallback((taskId: string) => {
    setRunnerState((prev) => ({
      ...prev,
      runQueue: prev.runQueue.filter(({ id }) => id !== taskId),
      runningTask: prev.runningTask?.id === taskId ? null : prev.runningTask,
    }))
  }, [])

  const onEventEnd = useCallback(async (props: OnEventEndProps) => {
    const updatedTask = await handleEventEnd(props)
    if (!updatedTask) return

    console.log(1234, updatedTask)
    const { logs } = updatedTask

    setRunnerState((prev) => {
      // const eventAlreadyMarked = prev?.eventsCompleted?.some((e) => e.id === newEvent.id)
      // if (eventAlreadyMarked) return prev
      return {
        ...prev,
        eventsCompleted: [...logs],
      }
    })
  }, [])

  const incrementTaskRetries = useCallback(
    () =>
      setRunnerState((prev) => ({
        ...prev,
        runningTask: prev.runningTask
          ? { ...prev.runningTask, retries: (prev.runningTask.retries || 0) + 1 }
          : null,
      })),
    [],
  )

  // When the queue updates, process the first task
  useEffect(() => {
    if (runQueue?.length === 0) {
      resetRunnerState()
      return
    }

    if (!runningTask) {
      const runningTask = runQueue[0]
      setRunnerState((prev) => ({ ...prev, runningTask }))
    }
  }, [runQueue])

  useEffect(() => {
    if (!runningTask) return

    // @TODO: if running & in progress... in step 1.2... etc

    const executeTaskEvents = async () => {
      const { task, id: taskId, flow, retries = 0 } = runningTask

      if (retries >= 3) {
        console.log(3333, 'failed')

        await endTask(task, 'failed')
        removeFromQueue(taskId)
        return
      }

      try {
        // @TODO: Events from flow ... -> migrate to events from TASK with up to date state...
        const { events, if: flowId } = flow
        const data = await buildFormData({ variables: task.state.variables, events })

        await runEvents({
          task,
          events,
          flowId,
          data,
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
        await endTask(task)
        removeFromQueue(taskId)
      }, 2000)
    }

    executeTaskEvents()
  }, [runningTask])

  return {
    runnerState,
    setRunnerState,
    resetRunnerState,
    addToQueue,
    removeFromQueue,
  }
}
