// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const getTimeoutAbortController = (timeMilliseconds: number) => {
  const controller = new AbortController()
  setTimeout(() => controller.abort(), timeMilliseconds)
  return controller
}
