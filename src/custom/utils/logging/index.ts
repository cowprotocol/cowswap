import OperatorError from 'api/gnosisProtocol/errors/OperatorError'
import QuoteError from 'api/gnosisProtocol/errors/QuoteError'

type SentryErrorOptions = {
  message: string
  name: string
  optionalTags?: {
    [x: string]: string
  }
}

export function constructSentryError(
  baseError: QuoteError | OperatorError | Error,
  response: any,
  { message, name, optionalTags = {} }: SentryErrorOptions
) {
  const constructedError = Object.assign(new Error(), baseError, {
    message,
    name,
  })

  const tags = {
    ...optionalTags,
    errorType: baseError?.name,
    responseStatus: response.status,
  }

  return { baseError, sentryError: constructedError, tags }
}

// checks response for non json/application return type and throw appropriate error
export function checkAndThrowIfJsonSerialisableError(response: Response) {
  // don't attempt json parse if not json response...
  if (response.headers.get('Content-Type') !== 'application/json') {
    throw new Error(`Error code ${response.status} occurred`)
  }
}
