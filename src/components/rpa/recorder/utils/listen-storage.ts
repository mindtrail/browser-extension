import { getStorage } from '~lib/storage'
import { STORAGE_AREA } from '~/lib/constants'

export const onBackgroundEvent = async (callback) => {
  const storage = await getStorage()

  storage.watch({
    [STORAGE_AREA.RECORDER]: (changes) => {
      console.log(222, 'onBackgroundEvent', changes)

      const oldnavEvents = changes.oldValue.navEvents || []
      const newnavEvents = changes.newValue.navEvents || []
      if (newnavEvents.length <= oldnavEvents.length) return
      const newEvents = newnavEvents.slice(oldnavEvents.length)
      newEvents.forEach((event) => {
        callback({ type: event.type, ...event.data })
      })
    },
  })
}
