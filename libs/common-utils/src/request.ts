export const getTimeoutAbortController = (timeMilliseconds: number) => {
  const controller = new AbortController()
  setTimeout(() => controller.abort(), timeMilliseconds)
  return controller
}
