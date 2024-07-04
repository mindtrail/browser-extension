export async function navigationComponent({ event }: RunnerComponentProps) {
  window.location.href = event.value
}
