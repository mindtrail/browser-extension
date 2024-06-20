let lastClick = 0
let secondLastClick = 0
let totalClicks = 0
let target = null
let clickedObject = null
var rageThreshold = 6

function clickCounter(event) {
  totalClicks++
  if (totalClicks > rageThreshold) {
    totalClicks = 0
  }
  console.log(totalClicks)
}

function rageClick(event) {
  var now = Math.floor(Date.now())
  if (now - lastClick < 500 && now - secondLastClick && totalClicks >= rageThreshold) {
    console.log('rage click on element ' + clickedObject)
    //newrelic.addPageAction(clickedObject, 1);
  }

  secondLastClick = lastClick
  lastClick = now
  console.log(event.type + ' ' + now)
  console.log((now - secondLastClick) / 1000)
}
function clickedElement(element) {
  element = element || window.event
  ;(target = element.target || element.srcElement),
    (clickedObject = target.id || target.className)
  //console.log(text);
}
