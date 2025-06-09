import * as Sentry from '@sentry/react'

type SentryErrorOptions = {
  message: string
  name: string
  optionalTags?: {
    [x: string]: string
  }
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function constructSentryError(
  baseError: Error,
  // TODO: Replace any with proper type definitions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function checkAndThrowIfJsonSerialisableError(response: Response) {
  // don't attempt json parse if not json response...
  if (response.headers.get('Content-Type') !== 'application/json') {
    throw new Error(`Error code ${response.status} occurred`)
  }
}

export enum SentryTag {
  DISCONNECTED = 'DISCONNECTED',
  UNKNOWN = 'UNKNOWN',
}

type PriceFeed = { res: boolean; name: string }
// TODO: Replace any with proper type definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ExceptionContext = Record<string, any>
type ExceptionParams = { message: string; tags: Record<string, string>; context: ExceptionContext }
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function capturePriceFeedException({ message, tags, context }: ExceptionParams, ...feedResults: PriceFeed[]) {
  // no feed result? reduce an array into a list of feed names
  const emptyFeedsList = feedResults.reduce<string[]>((acc, { res, name }) => (!res ? acc.concat(name) : acc), [])

  const contexts = {
    params: {
      ...context,
      endpoint: emptyFeedsList,
    },
  }
  // report this to sentry
  Sentry.captureMessage(message, {
    tags,
    contexts,
  })
}
