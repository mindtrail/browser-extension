export function getContent({ type, target }) {
  const textContent =
    type === 'click'
      ? target.innerText
        ? target.innerText.trim()
        : target.tagName
      : null

  return textContent
}
