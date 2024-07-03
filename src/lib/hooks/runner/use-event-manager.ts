import { useCallback } from 'react'
import { handleEventStart, handleEventEnd } from '~/lib/utils/runner/execution/task-utils'

export const useEventManager = () => {
  const onEventStart = useCallback(handleEventStart, [])

  const onEventEnd = useCallback(async (props: OnEventEndProps) => {
    await handleEventEnd(props)
    const { event: newEvent, setRunnerState } = props

    setRunnerState((prev) => {
      const eventAlreadyMarked = prev.eventsCompleted.some((e) => e.id === newEvent.id)
      if (eventAlreadyMarked) return prev

      return {
        ...prev,
        eventsCompleted: [...prev.eventsCompleted, newEvent],
      }
    })
  }, [])

  return { onEventStart, onEventEnd }
}
