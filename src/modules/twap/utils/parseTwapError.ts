const DEFAULT_ERROR_MESSAGE = 'Something went wrong creating your order'

function getIvalidArgumentError(error: any): string | undefined {
  if (error && error.message && error.message.includes('INVALID_ARGUMENT')) {
    const matches = error.message.match(/argument="([^"]+)"/)
    const invalidArgument = matches?.length ? matches[1] : ''

    if (invalidArgument) {
      return `Invalid argument "${invalidArgument}" provided`
    }
  }
  return undefined
}

export function getErrorMessage(error: any): string {
  return getIvalidArgumentError(error) || error.message || DEFAULT_ERROR_MESSAGE
}
