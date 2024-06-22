import { sendMessageToBg } from '~lib/utils/bg-messaging'
import { MESSAGES, MESSAGE_AREAS } from '~/lib/constants'
import { generateMetadata } from '~/lib/llm/openai'

export const updateRecordedEvents = (event, setRecorderState) => {
  // @TODO: reimplement this
  // const prevEvents = prevState?.eventsList
  // lastKey = generateKey(event.eventKey, lastKey, prevEvents)
  // use array for each key instead of single event (potentially useful for repetitive events)

  setRecorderState((prevState) => {
    const eventAlreadyInList = prevState?.eventsList.find(
      (e) => e.selector === event.selector,
    )
    const updatedEventsList = eventAlreadyInList
      ? prevState?.eventsList.map((e) => {
          if (e.selector === event.selector) {
            return {
              ...event,
              count: e.count + 1,
            }
          }
          return e
        })
      : [...prevState?.eventsList, event]

    return {
      ...prevState,
      eventsList: updatedEventsList,
    }
  })
}

export const deleteEvent = (index: number, setRecorderState) => {
  setRecorderState((prevState) => {
    const remainingEvents = prevState?.eventsList.filter((_e, i) => i !== index)
    return {
      ...prevState,
      eventsList: remainingEvents,
    }
  })
}

export const toggleRecording = async (props) => {
  const { isRecording, eventsList, setRecorderState, resetRecorderState } = props

  if (!isRecording) {
    setRecorderState((prevState) => ({
      ...prevState,
      isRecording: true,
    }))
    return
  }

  if (!eventsList.length) {
    resetRecorderState()
    return
  }

  setRecorderState((prevState) => ({
    ...prevState,
    isSaving: true,
  }))

  const eventsRecorded = Array.from(eventsList.values()).flat()
  const flow = await generateMetadata(eventsRecorded)

  flow.events = eventsRecorded.map((event: Event, index) => {
    return {
      ...event,
      event_name: flow.events[index]?.event_name,
      event_description: flow.events[index]?.event_description,
    }
  })

  setRecorderState((prevState) => ({
    ...prevState,
    isRecording: false,
    isSaving: false,
  }))

  sendMessageToBg({
    name: MESSAGE_AREAS.FLOWS,
    body: {
      type: MESSAGES.CREATE_FLOW,
      payload: flow,
    },
  })

  resetRecorderState()
}

export const togglePause = (setRecorderState) => {
  setRecorderState((prevState) => ({
    ...prevState,
    isPaused: !prevState.isPaused,
  }))
}

export const deleteAllEvents = (setRecorderState) => {
  setRecorderState((prevState) => ({
    ...prevState,
    eventsList: [],
  }))
}
