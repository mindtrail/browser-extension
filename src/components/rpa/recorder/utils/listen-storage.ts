import { getStorage } from '~lib/storage'
import { STORAGE_AREA } from '~/lib/constants'

export const onBackgroundEvent = async (callback) => {
  const storage = await getStorage()

  storage.watch({
    [STORAGE_AREA.RECORDER]: ({ oldValue, newValue }) => {
      const oldEventsList = oldValue.navEvents || []
      const newEventsList = newValue.navEvents || []

      console.log(222, newValue)
      if (newEventsList.length <= oldEventsList.length) {
        return
      }

      const newEvents = newEventsList.slice(oldEventsList.length)
      newEvents.forEach((event) => {
        callback({ type: event.type, ...event.data })
      })
    },
  })
}
