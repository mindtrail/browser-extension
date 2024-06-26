// import * as cheerio from 'cheerio'

// This html context is used to generate possible actions.
// We need it to be HTML instead of just text beacause the essence of actions is to generate the selectors.
export function getHtmlContext(element) {
  // const HTML_TAGS_TO_EXCLUDE = 'script, style, noscript, meta, link, svg, plasmo-csui'
  // const $ = cheerio.load(event.html_context || document.body.innerHTML)
  // $(HTML_TAGS_TO_EXCLUDE)?.remove()
  // $('*').removeAttr('class')
  // $('*').removeAttr('style')
  // const html_context = $('body').html() || ''

  const html_context = element.parentElement.outerHTML
  console.log(html_context)
  return html_context
}
