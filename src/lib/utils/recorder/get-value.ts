export function getValue({ type, target }) {
  const value =
    type === 'input' &&
    (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)
      ? target.value
      : null
  return value
}
