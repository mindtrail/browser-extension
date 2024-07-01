import { sendMessageToBg } from '~lib/utils/bg-messaging'
import { MESSAGES, MESSAGE_AREAS } from '~/lib/constants'
import { generateMetadata, mergeEvents, generateActions } from '~/lib/llm/openai'
import { getActionGroupsByKeys, createActionGroup } from '~/lib/supabase'

// TODO: experiment with persisting actions for `url` or for `url+selector`
function buildActionGroupKey(event) {
  return `[${event.baseURI}][${event.selector}]`
}

export const updateRecordedEvents = async (event, setRecorderState) => {
  // @TODO: reimplement this
  // const prevEvents = prevState?.eventsList
  // lastKey = generateKey(event.eventKey, lastKey, prevEvents)
  // use array for each key instead of single event (potentially useful for repetitive events)

  // Create possible actions for the given actionGroup key
  const actionGroups = await getActionGroupsByKeys([buildActionGroupKey(event)])
  if (!actionGroups.length) {
    const actions = await generateActions(event.html_context)
    await createActionGroup({
      key: buildActionGroupKey(event),
      actions,
    })
  }

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

  const eventsRecorded = Array.from(eventsList.values())
    .flat()
    .map((event: any) => {
      delete event.eventKey // clean unnecessary property
      return event
    })

  // Generate flow (name,description) + events (name,description)
  const flow = await generateMetadata(eventsRecorded)
  flow.events = eventsRecorded.map((event: any, index) => {
    return {
      ...event,
      event_name: flow.events[index]?.event_name,
      event_description: flow.events[index]?.event_description,
    }
  })

  // Get possible actions for each unique actionGroup key
  const eventsKeys: string[] = Array.from(
    new Set(flow.events.map((event: any) => buildActionGroupKey(event))),
  )
  const actionGroups = await getActionGroupsByKeys(eventsKeys)

  // Update events via possible actions
  flow.events = await mergeEvents({ events: flow.events, actionGroups })

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
