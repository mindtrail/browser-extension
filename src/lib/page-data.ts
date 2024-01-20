export const getPageData = (autoSave: boolean = false) => {
  const html = document.documentElement.outerHTML
  const title = document.title
  const url = window.location.href

  const description = document
    .querySelector('meta[name="description"]')
    ?.getAttribute('content')

  let image = document.querySelector('meta[property="og:image"]')?.getAttribute('content')

  // The image may be a relative path, so we need to make it absolute
  if (image && !image.startsWith('http')) {
    const { origin } = window.location
    image = `${origin}/${image}`
  }

  return {
    url,
    title,
    description,
    html,
    image,
    autoSave,
  }
}
