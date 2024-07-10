import {
  getActionsStoreByKeys as _getActionsStoreByKeys,
  createActionsStore,
  getActionsStore as _getActionsStore,
  onActionsStoreChange,
  updateActionsStore,
} from '~/lib/supabase'
import { getHtmlContext } from '~lib/utils/recorder/get-html-context'
import { generateActions } from '~lib/llm/openai'
import { getSelectors } from '~lib/utils/recorder/find-selector'

export async function setActionsStore(key: string) {
  const actionsStore = await getActionsStoreByKeys([key])
  if (!actionsStore.length) {
    await createActionsStore({
      key,
      status: 'pending',
    })
  }
}

export async function getActionsStoreByKeys(keys: string[]) {
  return _getActionsStoreByKeys(keys)
}

let listenersAdded = false
if (!listenersAdded) {
  onActionsStoreChange(async (payload) => {
    if (payload.new && payload.new.status === 'pending') {
      console.log('new actions store', payload.new.key)
      const html = getHtmlContext(document.body)
      const selectors = getSelectors(document.body)
      const actions = await generateActions(html, selectors)
      console.log('actions', actions)
      const actionsStoreUpdates = {
        status: 'completed',
        actions,
        context: html,
      }
      await updateActionsStore(payload.new.id, actionsStoreUpdates)
    }
  })
  listenersAdded = true
}
