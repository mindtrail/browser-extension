import { getStorage } from '~lib/storage'
import { STORAGE_AREA } from '~/lib/constants'

export const onBackgroundEvent = async (callback) => {
  const storage = await getStorage()

  storage.watch({
    [STORAGE_AREA.RECORDER]: ({ oldValue, newValue }) => {
      const oldNavEvents = oldValue.navEvents || []
      const newNavEvents = newValue.navEvents || []

      if (newNavEvents.length <= oldNavEvents.length) {
        return
      }

      const newEvents = newNavEvents.slice(oldNavEvents.length)
      newEvents.forEach((event) => {
        callback({ type: event.type, ...event.data })
      })
    },
  })
}
