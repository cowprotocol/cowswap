// TODO: Replace any with proper type definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function errorToString(error: any): string {
  return typeof error === 'string'
    ? error
    : error.message || (typeof error === 'object' ? JSON.stringify(error) : error.toString())
}
