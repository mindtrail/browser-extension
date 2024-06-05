import { useState } from 'react'
import type { KeyboardEvent, MouseEvent } from 'react'

import { IconSpinner } from '~components/icons/spinner'
import { Typography } from '~/components/typography'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { ScrollArea } from '~/components/ui/scroll-area'
import { MESSAGES, MESSAGE_AREAS } from '~/lib/constants'
import { addHttpsIfMissing } from '~lib/utils'
import { sendMessageToBg } from '~lib/utils/bg-messaging'

type SearchResult = {
  hostName: string
  image: string
  description: string
  summary: string
  name: string
}

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

    const payload = {
      searchQuery: searchQuery.trim(),
    }

    const websites = await sendMessageToBg({
      name: MESSAGE_AREAS.SEARCH_HISTORY,
      body: payload,
    })

    setProcessing(false)
    setFoundWebsite(websites)
    // do something with response here, not outside the function

    console.log(foundWebsite)
  }

  return (
    <div className='flex flex-col gap-4 px-4 py-4'>
      <div className='flex flex-col flex-1 gap-4 w-full'>
        <Input
          className='flex-1 border-[1px] disabled:bg-gray-100 disabled:text-gray-400 px-2'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='A website about travel'
        />
        <div className='flex gap-2 items-center'>
          {/* <Label htmlFor="flowiseURL">History search:</Label> */}
          <Button
            onClick={handleSearch}
            disabled={!searchQuery || processing}
            size='sm'
            className='w-full'
          >
            {processing && <IconSpinner className='mr-2' />}
            Search
          </Button>
        </div>
        <div className='w-full max-w-2xl flex flex-col flex-1'>
          {foundWebsite ? (
            <ScrollArea className='flex-1 flex flex-col max-h-[70vh] rounded-md border py-2 px-2'>
              <a
                href={addHttpsIfMissing(foundWebsite?.name)}
                target='_blank'
                className='flex flex-1 flex-col gap-2'
              >
                <Typography variant='h5' className='text-gray-600'>
                  {foundWebsite?.hostName}
                </Typography>
                <Typography variant='p' className='text-gray-600 leading-5'>
                  {foundWebsite?.description}
                </Typography>
                <img
                  width={500}
                  alt={foundWebsite?.description}
                  src={foundWebsite?.image}
                />
              </a>
            </ScrollArea>
          ) : null}
        </div>
      </div>
    </div>
  )
}
