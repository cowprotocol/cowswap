import { t } from '@lingui/core/macro'

// TODO: Replace any with proper type definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getIvalidArgumentError(error: any): string | undefined {
  if (error && error.message && error.message.includes('INVALID_ARGUMENT')) {
    const matches = error.message.match(/argument="([^"]+)"/)
    const invalidArgument = matches?.length ? matches[1] : ''

    if (invalidArgument) {
      return t`Invalid argument "${invalidArgument}" provided`
    }
  }
  return undefined
}

// TODO: Replace any with proper type definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getErrorMessage(error: any): string {
  const DEFAULT_ERROR_MESSAGE = t`Something went wrong creating your order`

  return getIvalidArgumentError(error) || error.message || DEFAULT_ERROR_MESSAGE
}
