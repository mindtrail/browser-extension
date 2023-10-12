interface Thumbnail {
  source: HTMLCanvasElement
  size?: { width: number; height: number }
}

function getThumbnail({ source }) {
  const { width, height } = source
  const scale = 320 / width

  console.log(scale)

  var canvas = document.createElement("canvas")
  canvas.width = width * scale
  canvas.height = height * scale

  canvas.getContext("2d").drawImage(source, 0, 0, canvas.width, canvas.height)

  return canvas
}
