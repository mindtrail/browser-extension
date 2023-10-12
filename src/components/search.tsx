import { GlobeIcon } from '@radix-ui/react-icons'
import { useEffect, useState } from 'react'
import type { KeyboardEvent, MouseEvent } from 'react'

import { IconSpinner } from '~/components/icon-spinner'
import Typography from '~/components/typography'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { ScrollArea } from '~/components/ui/scroll-area'

// type SearchResult = Document['metadata'] & {
// image: string
// summary: string
// }

type SearchResult = {
  hostName: string
  image: string
  metaDescription: string
  summary: string
}

const getRouteWithoutProtocol = (url: string) => {
  const match = url.match(/^https?:\/\/([^:]+)([^?]+)?/)
  return match ? match[1] + (match[2] || '') : ''
}

const TEST_USER = 'clnj8rr9r00009krsmk10j07o'
export function Search() {
  const [searchQuery, setSearchQuery] = useState('')
  const [processing, setProcessing] = useState(false)
  const [foundWebsite, setFoundWebsite] = useState<SearchResult>()

  // Save settings to local storage

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch(event)
    }
  }

  const handleSearch = async (event: MouseEvent | KeyboardEvent) => {
    event.preventDefault()
    setProcessing(true)

    try {
      const result = await fetch('/api/history', {
        method: 'POST',
        body: JSON.stringify({
          userId: TEST_USER,
          searchQuery: searchQuery.trim(),
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      const websites = await result.json()
      setProcessing(false)
      setFoundWebsite(websites)
    } catch (e) {
      console.log('error', e)
      setProcessing(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      <div className="flex flex-col flex-1 gap-4 w-full">
        <Input
          className="flex-1 bg-white border-[1px] disabled:bg-gray-100 disabled:text-gray-400 px-2"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="A website about travel"
        />
        <div className="flex gap-2 items-center">
          {/* <Label htmlFor="flowiseURL">History search:</Label> */}
          <Button
            onClick={handleSearch}
            disabled={!searchQuery}
            size="sm"
            className="w-full">
            {processing && <IconSpinner className="mr-2" />}
            Search
          </Button>
        </div>
        <div className="w-full max-w-2xl flex flex-col flex-1 gap-6 pt-6">
          {processing && (
            <div className="flex gap-4 items-center">
              <IconSpinner className="mr-2" />
              Searching for a match...
            </div>
          )}

          {foundWebsite ? (
            <div className="flex flex-col gap-2">
              <Typography variant="h5" className="text-gray-600 capitalize">
                {foundWebsite?.hostName}
              </Typography>
              <Typography variant="p" className="text-gray-600">
                {foundWebsite?.summary}
              </Typography>
              <img
                width={500}
                alt={foundWebsite?.metaDescription}
                src={foundWebsite?.image}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
