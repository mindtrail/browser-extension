export const getPageData = (autoSave: boolean = true) => {
  const html = document.documentElement.outerHTML
  const title = document.title
  const description = // @ts-ignore
    document.querySelector('meta[name="description"]')?.content
  // @ts-ignore
  const image = document.querySelector('meta[property="og:image"]')?.content
  const url = window.location.href

  return {
    url,
    title,
    description,
    content: html,
    image,
    autoSave,
  }
}
