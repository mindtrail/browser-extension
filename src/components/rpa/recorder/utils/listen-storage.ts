import { getStorage } from '~lib/storage'
import { STORAGE_AREA } from '~/lib/constants'

export const onBackgroundEvent = async (callback) => {
  const storage = await getStorage()

  storage.watch({
    [STORAGE_AREA.RECORDER]: (changes) => {
      console.log(222, 'onBackgroundEvent', changes)

      const oldBackgroundEvents = changes.oldValue.backgroundEvents || []
      const newBackgroundEvents = changes.newValue.backgroundEvents || []
      if (newBackgroundEvents.length <= oldBackgroundEvents.length) return
      const newEvents = newBackgroundEvents.slice(oldBackgroundEvents.length)
      newEvents.forEach((event) => {
        callback({ type: event.type, ...event.data })
      })
    },
  })
}
