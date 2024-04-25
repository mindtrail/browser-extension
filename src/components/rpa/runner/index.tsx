import React, { useState } from 'react'
import runEvents from './run-events'

export function FlowRunner() {
    const [flows, setFlows] = useState(() =>
        JSON.parse(localStorage.getItem('flows') || '{}'),
    )
    const [hoveredFlowId, setHoveredFlowId] = useState(null)

    function runFlow(flowId) {
        const events = flows[flowId] || []
        runEvents({ events })
    }

    function removeFlow(flowId) {
        const updatedFlows = { ...flows }
        delete updatedFlows[flowId]
        setFlows(updatedFlows)
        localStorage.setItem('flows', JSON.stringify(updatedFlows))
    }

    return (
        <div className="p-5">
            {Object.keys(flows).map((flowId, index) => (
                <div
                    key={flowId}
                    className="relative group block"
                    onMouseEnter={() => setHoveredFlowId(flowId)}
                    onMouseLeave={() => setHoveredFlowId(null)}
                >
                    <button
                        className="bg-blue-500 text-white px-5 py-2.5 mt-3 rounded w-full"
                        onClick={() => runFlow(flowId)}
                    >
                        Flow {index + 1}
                    </button>
                    <button
                        className={`absolute top-1 right-[-7px] p-1 rounded-full bg-gray-500 text-white ${hoveredFlowId === flowId ? 'opacity-100' : 'opacity-0'
                            } transition-opacity duration-300 ease-in-out`}
                        onClick={() => removeFlow(flowId)}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>
            ))}
        </div>
    )
}
