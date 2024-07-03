import { useCallback } from 'react'
import { handleEventStart, handleEventEnd } from '~/lib/utils/runner/execution/task-utils'

export const useEventManager = () => {
  const onEventStart = useCallback(handleEventStart, [])

  const onEventEnd = useCallback(async (props: OnEventEndProps) => {
    const { event, setRunnerState } = props
    await handleEventEnd(props)

    setRunnerState((prev) => {
      const eventAlreadyRan = prev.eventsCompleted.some((e) => e.id === event.id)
      if (eventAlreadyRan) return prev

      return {
        ...prev,
        eventsCompleted: [...prev.eventsCompleted, event],
      }
    })
  }, [])

  return { onEventStart, onEventEnd }
}
