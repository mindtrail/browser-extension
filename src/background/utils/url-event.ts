import { debounceEvent } from '~lib/utils/event-handlers/debounce-event'
import { EVENT_TYPES } from '~/lib/constants'
import { createBaseEvent } from '../../lib/utils/event-handlers/base-event'

export function handleUrlEvent(event, callback) {
  const { eventKey, eventDetails } = createBaseEvent({ event, type: EVENT_TYPES.NAV })
  debounceEvent(eventKey, eventDetails, callback)
}

import { getStorage } from '~/lib/storage'
import { STORAGE_AREA } from '~/lib/constants'

export const onBackgroundEvent = async (callback) => {
  const storage = await getStorage()

  storage.watch({
    [STORAGE_AREA.RECORDER]: ({ oldValue, newValue }) => {
      const oldEventsList = oldValue.navEvents || []
      const newEventsList = newValue.navEvents || []

      if (newEventsList.length <= oldEventsList.length) {
        return
      }

      const newEvents = newEventsList.slice(oldEventsList.length)
      console.log(222, newEvents)
      newEvents.forEach((event) => {
        callback({ type: event.type, ...event.data })
      })
    },
  })
}