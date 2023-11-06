import { Cross1Icon, GlobeIcon } from '@radix-ui/react-icons'
import { useCallback, useState } from 'react'
import type { KeyboardEvent } from 'react'

import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Switch } from '~/components/ui/switch'
import { MESSAGES } from '~/lib/constants'

const URL_REGEX =
  /^(https?:\/\/)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(:[0-9]+)?(\/[\w.-]*)*\/?$/

const addHttpsIfMissing = (url: string) => {
  if (!/^https?:\/\//i.test(url)) {
    return 'https://' + url
  }
  return url
}

export type StorageData = {
  autoSave: boolean
  saveDelay: number
  excludeList: string[]
}

type SettingsProps = StorageData & {
  updateSettings: (settings: Partial<StorageData>) => void
}

export function Settings(props: SettingsProps) {
  const { autoSave, excludeList, saveDelay, updateSettings } = props

  const removeDomainFromExcludeList = (url: string) => {
    const updatedExcludeList = excludeList.filter((item) => item !== url)
    updateSettings({
      excludeList: updatedExcludeList,
    })
  }

  const excludeListKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const url = event.currentTarget.value

      if (!url || !URL_REGEX.test(url)) {
        console.error('invalid url', url)
        return
      }
      const updatedExcludeList = [...excludeList, addHttpsIfMissing(url)]
      updateSettings({
        excludeList: updatedExcludeList,
      })
      event.currentTarget.value = ''
    }
  }

  const updateAutoSave = useCallback(async () => {
    const autoSaveStatus = !autoSave
    updateSettings({
      autoSave: autoSaveStatus,
    })

    chrome.runtime.sendMessage({
      message: MESSAGES.UPDATE_ICON,
    })
  }, [autoSave])

  const saveDelayKeyDown = useCallback((event) => {
    if (event.key === 'Enter') {
      const saveDelay = parseInt(event.currentTarget.value)

      console.log(saveDelay)
      if (isNaN(saveDelay)) {
        return
      }

      updateSettings({
        saveDelay,
      })
    }
  }, [])

  return (
    <div className="flex flex-col gap-4 px-2">
      <div className="flex flex-col gap-3 px-2 py-4 rounded-md">
        {/* <div className="flex justify-between">
          <div className="flex flex-col">
            <Label htmlFor="track-bookmarks">Track Bookmarks</Label>
            <span className="text-slate-500">
              Browser, Twitter, Linkeding, etc.
            </span>
          </div>
          <Switch defaultChecked={true} id="track-bookmarks" />
        </div> */}
        <div className="flex justify-between">
          <div className="flex flex-col">
            <Label htmlFor="auto-save">Auto Save</Label>
            <span className="text-slate-500">
              Auto saves the pages you visit
            </span>
          </div>
          <Switch
            id="auto-save"
            checked={autoSave}
            onCheckedChange={updateAutoSave}
          />
        </div>
        {autoSave && (
          <div className="mt-2 flex flex-col gap-4">
            <div className="flex gap-4 items-center">
              <Label className="shrink-0" htmlFor="auto-save-time">
                Save After
              </Label>
              <Input
                id="auto-save-time"
                placeholder={saveDelay + ' seconds'}
                onKeyDown={saveDelayKeyDown}
              />
            </div>
            <Label htmlFor="exclude-list">Exclude List</Label>
            <Input
              id="exclude-list"
              placeholder="Website that should not be saved"
              onKeyDown={excludeListKeyDown}
            />
            <ScrollArea className="flex-1 relative flex flex-col max-h-[75vh] rounded-md border py-2 px-2">
              <ul className="flex flex-col gap-1 text-sm text-slate-500">
                {excludeList.map((item, key) => (
                  <li
                    key={key}
                    className="flex items-center justify-between group">
                    <span className="flex gap-2 items-center">
                      <GlobeIcon />
                      {item}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="invisible group-hover:visible"
                      onClick={() => removeDomainFromExcludeList(item)}>
                      <Cross1Icon />
                    </Button>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  )
}
