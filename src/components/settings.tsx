import { Cross1Icon, GlobeIcon } from "@radix-ui/react-icons"
import { useState } from "react"

import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { ScrollArea } from "~/components/ui/scroll-area"
import { Switch } from "~/components/ui/switch"

const defaultExludedList = [
  "https://mail.google.com",
  "https://docs.google.com",
  "https://drive.google.com"
]

export function Settings() {
  const [autoSave, setAutoSave] = useState(true)
  const [excludedList, setExcludedList] = useState(defaultExludedList)

  const handleFileDelete = (url: string) => {
    const newList = excludedList.filter((item) => item !== url)
    setExcludedList(newList)
  }
  // Save settings to local storage

  return (
    <div className="flex flex-col gap-4 px-2">
      <div className="flex flex-col gap-3 px-2 py-4 rounded-md">
        <div className="flex justify-between">
          <div className="flex flex-col">
            <Label htmlFor="airplane-mode">Auto Save</Label>
            <span className="text-slate-500">
              Auto saves the pages you visit
            </span>
          </div>
          <Switch
            id="airplane-mode"
            checked={autoSave}
            onCheckedChange={() => {
              setAutoSave(!autoSave)
            }}
          />
        </div>
        {autoSave && (
          <div className="mt-2 flex flex-col gap-4">
            <div className="flex gap-4 items-center">
              <Label className="shrink-0" htmlFor="auto-save-time">
                Time on page
              </Label>
              <Input id="auto-save-time" placeholder="60 seconds" />
            </div>
            <Label htmlFor="include-list">Exclude List</Label>
            <Input
              id="include-list"
              placeholder="Website that should not be saved"
            />
            <ScrollArea className="flex-1 relative flex flex-col max-h-[75vh] rounded-md border py-2 px-2">
              <ul className="flex flex-col gap-1 text-sm text-slate-500">
                {excludedList.map((item, key) => (
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
                      onClick={() => handleFileDelete(item)}>
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
