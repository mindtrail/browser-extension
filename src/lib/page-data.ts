export const getPageData = (autoSave: boolean = true) => {
  const html = document.documentElement.outerHTML
  const pageTitle = document.title
  const metaDescription = // @ts-ignore
    document.querySelector('meta[name="description"]')?.content

  const url = window.location.href
  const hostName = window.location.hostname

  return {
    html,
    url,
    storageMetadata: {
      pageTitle,
      metaDescription,
      hostName,
      autoSave,
    },
  }
}
