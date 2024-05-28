import { extractProperties } from '../../utils/openai'
import { getSelector } from '../../recorder/utils/find-selector'

export async function extractTableEntities({ columns, entitySelectorPattern }) {
  const entitySelector = entitySelectorPattern.split(' ').pop()
  const tables = document.querySelectorAll('table')
  if (!tables.length) return []
  let allEntities = []

  for (const table of tables) {
    const tableSelector = getSelector(table)
    const rows = table.querySelectorAll('tbody tr')
    let entities = []
    rows.forEach((row, rowIndex) => {
      let dynamicColumns = columns
      if (!dynamicColumns.length) {
        dynamicColumns = Array.from(row.children).map((cell, index) => {
          return `__unknown_property_${index}__`
        })
      }
      const entity: Record<string, string> = {}
      dynamicColumns.forEach((col, index) => {
        const cell: any = row.children[index]
        if (!cell || !cell.innerText) return
        entity[col] = cell.innerText
        // let selector = `${tableSelector} > tbody > tr:nth-child(${
        //   rowIndex + 1
        // }) > td:nth-child(${index + 1}) ${entitySelector}`
        let selector = `${tableSelector} > tbody > tr:nth-child(${
          rowIndex + 1
        }) ${entitySelector}`
        entity.selector = entity.selector ? entity.selector : selector
      })
      if (
        Object.keys(entity).length > 1 ||
        (Object.keys(entity).length === 1 && !entity.selector)
      ) {
        entities.push(entity)
      }
    })

    // Call LLM to generate property keys if columns are not predefined
    if (!columns.length) {
      const keys = await extractProperties({ entities })
      entities = entities.map((entity) => {
        const updatedEntity: Record<string, string> = {}
        keys.forEach((key, index) => {
          const unknownKey = `__unknown_property_${index}__`
          if (entity[unknownKey]) updatedEntity[key] = entity[unknownKey]
          delete entity[unknownKey]
        })
        if (entity.selector) updatedEntity.selector = entity.selector
        return updatedEntity
      })
    }

    allEntities.push(...entities)
  }

  return allEntities
}
