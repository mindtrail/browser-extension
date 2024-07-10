export async function extractTable(selector) {
  const table: HTMLElement = document.querySelector(selector.default)

  // Check for thead and use it if available
  const thead = table.querySelector('thead')
  let headers = []

  if (thead) {
    headers = Array.from(thead.querySelectorAll('th')).map((th) => ({
      name: th.textContent.trim(),
      show: th.textContent.trim() !== '' && th.textContent.trim() !== 'Delete',
    }))
  } else {
    // Infer headers from the first row of tbody if no thead is present
    const firstRow = table.querySelector('tbody tr')
    if (firstRow) {
      headers = Array.from(firstRow.querySelectorAll('th, td')).map((cell, index) => ({
        name: cell.textContent.trim() || `Column ${index + 1}`,
        show: true,
      }))
    }
  }

  const rows = table.querySelectorAll('tbody tr')

  let entities = []
  rows.forEach((row, rowIndex) => {
    let entity = {}
    const cells = row.querySelectorAll('td, th')
    cells.forEach((cell, index) => {
      let th = headers[index] || { name: `Column ${index + 1}`, show: true }
      if (th.show) {
        entity[th.name] = cell.textContent.trim()
      }
    })
    entities.push(entity)
  })

  return entities
}
