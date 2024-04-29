import React, { useState, useEffect } from 'react'
import { runEvents } from './run-events'
import { mergeInputEvents } from '../utils/merge-input-events'
import { discardClickInputEvents } from '../utils/discard-click-input-events'
import { Actions } from '../actions'
import { buildInputData } from './build-input-data'
import { extractParams } from '../utils/openai'
import { getFlows, onFlowsChange, deleteFlow } from '../utils/supabase'
import { parseQuery } from './parse-query'

export function FlowRunner() {
    const [hoveredFlowId, setHoveredFlowId] = useState(null)
    const [currentEvents, setCurrentEvents] = useState([])
    const [query, setQuery] = useState('')
    const [flows, setFlows] = useState([])

    useEffect(() => {
        const fetchFlows = async () => {
            const { data } = await getFlows()
            setFlows(data)
        }
        fetchFlows()
        return onFlowsChange(fetchFlows)
    }, [])

    function getFlowEvents(id) {
        let events = flows.find((flow) => flow.id === id)?.events || []
        events = mergeInputEvents(events)
        events = discardClickInputEvents(events)
        return events
    }

    async function runFlow({ id, query }: { id?: string; query?: string }) {
        let ids = !id && query ? await parseQuery(query, flows) : [{ flowId: id }]
        for (const { flowId } of ids) {
            setCurrentEvents([])
            const events = getFlowEvents(flowId)
            const data = query
                ? await extractParams(
                    `${query} in this format: ${JSON.stringify(buildInputData(events))}`,
                )
                : {}
            await runEvents({
                events,
                data,
                callback: (event) => setCurrentEvents((prevEvents) => [...prevEvents, event]),
            })
        }
    }

    async function removeFlow(id) {
        await deleteFlow(id)
        setCurrentEvents([])
    }

    return (
        <div className='px-4'>
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    runFlow({ query })
                }}
            >
                <input
                    type='text'
                    className='w-full p-2 border border-gray-300 rounded mb-3'
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </form>
            {flows?.map((flow, index) => (
                <div
                    key={flow.id}
                    className='relative group block'
                    onMouseEnter={() => setHoveredFlowId(flow.id)}
                    onMouseLeave={() => setHoveredFlowId(null)}
                >
                    <button
                        className='bg-blue-500 text-white px-5 py-2.5 mt-3 rounded w-full'
                        onClick={() => runFlow({ id: flow.id, query })}
                    >
                        {flow.name}
                    </button>
                    <button
                        className={`absolute top-1 right-[-7px] p-1 rounded-full bg-gray-500 text-white ${hoveredFlowId === flow.id ? 'opacity-100' : 'opacity-0'
                            } transition-opacity duration-300 ease-in-out`}
                        onClick={() => removeFlow(flow.id)}
                    >
                        <svg
                            xmlns='http://www.w3.org/2000/svg'
                            width='12'
                            height='12'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                        >
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M6 18L18 6M6 6l12 12'
                            />
                        </svg>
                    </button>
                </div>
            ))}
            <Actions events={currentEvents} />
        </div>
    )
}
