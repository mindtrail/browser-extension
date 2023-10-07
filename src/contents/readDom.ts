import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["https://*/*"],
  all_frames: true
}

// setTimeout(() => {
//   const dom = document.documentElement.outerHTML
//   const payload = {
//     type: "dom",
//     url: window.location.href,
//     dom
//   }
//   console.log(payload)

//   fetch("http://localhost:3000", {
//     method: "POST",
//     body: JSON.stringify(payload),
//     headers: {
//       "Content-Type": "application/json"
//     }
//   })
// }, 1000 * 60) // after 1 minute
