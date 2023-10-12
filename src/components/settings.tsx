import { useState } from "react"

import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Switch } from "~/components/ui/switch"

export function Settings() {
  const [autoSave, setAutoSave] = useState(true)
  // Save settings to local storage

  return (
    <div className="flex flex-col gap-4 px-2 py-2">
      <div className="flex flex-col gap-3 border px-2 py-4 rounded-md">
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
          <div className="flex gap-4 items-center">
            <Label className="shrink-0" htmlFor="auto-save-time">
              Time on page
            </Label>
            <Input id="auto-save-time" placeholder="60 seconds" />
          </div>
        )}
      </div>
    </div>
  )
}
