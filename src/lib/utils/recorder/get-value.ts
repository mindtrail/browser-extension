import { ACTION_TYPE } from '~lib/constants'

export function getValue({ type, target }) {
  if (type === ACTION_TYPE.CLICK || type === ACTION_TYPE.EXTRACT) {
    return target.innerText ? target.innerText.trim() : target.tagName
  }

  if (type === ACTION_TYPE.INPUT) {
    return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement
      ? target.value
      : null
  }
}
