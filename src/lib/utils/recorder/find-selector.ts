import { finder } from '@medv/finder'

export function getSelector(element) {
  const selector = finder(element, {
    tagName: () => true,
    className: (value) => {
      const whitelist = []
      if (whitelist.includes(value)) return true
      return false
    },
    attr: (name, value) => {
      const whitelist = ['id', 'label']
      if (whitelist.includes(name)) return true
      return false
    },
    seedMinLength: 5,
    optimizedMinLength: 2,
    threshold: 3000,
    timeoutMs: 1000,
  })

  return selector
}
