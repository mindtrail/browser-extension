import { EVENT_TYPES } from '~lib/constants'

export function getValue({ type, target }) {
  if (type === EVENT_TYPES.CLICK || type === EVENT_TYPES.EXTRACT) {
    return target.innerText ? target.innerText.trim() : target.tagName
  }

  if (type === EVENT_TYPES.INPUT) {
    return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement
      ? target.value
      : null
  }
}
