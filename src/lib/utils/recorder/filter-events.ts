const DEFAULT_OPTIONS = { interval: 750, limit: 3 }

let clickCounts = new Map()
let clickTimers = new Map()

export function detectRageClicks(eventKey, options = DEFAULT_OPTIONS) {
  let count = clickCounts.get(eventKey) || 0
  let timer = clickTimers.get(eventKey)

  if (timer) {
    clearTimeout(timer)
  }

  timer = setTimeout(() => {
    clickCounts.set(eventKey, 0)
    clickTimers.delete(eventKey)
  }, options.interval)

  count++
  clickCounts.set(eventKey, count)
  clickTimers.set(eventKey, timer)

  if (count >= options.limit) {
    clearTimeout(timer)
    // clickCounts.set(eventKey, 0)
    // clickTimers.delete(eventKey)
    console.log('rage click')

    return true // Skip queuing if it's a rage click
  }
}

export function detectErrorClicks(callback) {
  let error
  window.onerror = function (msg) {
    error = msg
  }
  const listener = function (event) {
    const selector = event.target
    setTimeout(function () {
      if (error) {
        callback(selector, error, function () {
          document.removeEventListener('click', listener)
        })
      }
      error = undefined
    }, 0)
  }
  document.addEventListener('click', listener)
}
