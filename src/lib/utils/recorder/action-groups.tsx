import {
  getActionGroupsByKeys as _getActionGroupsByKeys,
  createActionGroup,
  getActionGroups as _getActionGroups,
  onActionGroupsChange,
  updateActionGroup,
} from '~/lib/supabase'
import { getHtmlContext } from '~lib/utils/recorder/get-html-context'
import { generateActionsV2 } from '~lib/llm/openai'

export async function setActionGroup(key: string) {
  const actionGroups = await getActionGroupsByKeys([key])
  if (!actionGroups.length) {
    await createActionGroup({
      key,
      status: 'pending',
    })
  }
}

export async function getActionGroupsByKeys(keys: string[]) {
  return _getActionGroupsByKeys(keys)
}

let listenersAdded = false
if (!listenersAdded) {
  onActionGroupsChange(async (payload) => {
    if (payload.new && payload.new.status === 'pending') {
      console.log('new action group', payload.new.key)
      const html = getHtmlContext(document.body)
      const actions = await generateActionsV2(html)
      console.log('actions', actions)
      const actionGroupUpdates = {
        status: 'completed',
        actions,
        context: html,
      }
      await updateActionGroup(payload.new.id, actionGroupUpdates)
    }
  })
  listenersAdded = true
}
