import { ACTION_TYPES } from '~lib/constants'

export function getValue({ type, target }) {
  if (type === ACTION_TYPES.CLICK || type === ACTION_TYPES.EXTRACT) {
    return target.innerText ? target.innerText.trim() : target.tagName
  }

  if (type === ACTION_TYPES.INPUT) {
    return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement
      ? target.value
      : null
  }
}
