import BlocknativeSdk from 'bnc-sdk'
import * as Sentry from '@sentry/browser'
import { getSupportedChainIds } from 'utils/supportedChainId'

const BLOCKNATIVE_API_KEY = process.env.REACT_APP_BLOCKNATIVE_API_KEY

interface SDKError {
  message: string
  error?: any
  account?: string
  transaction?: string
}

if (!BLOCKNATIVE_API_KEY) {
  console.warn('[blocknative] Missing BLOCKNATIVE_API_KEY')
  const { sentryError, tags } = constructSentryError(new Error(), { message: 'Blocknative API key not set' })
  Sentry.captureException(sentryError, {
    tags,
  })
}

export const sdk = !BLOCKNATIVE_API_KEY
  ? {}
  : getSupportedChainIds().reduce<Record<number, BlocknativeSdk | null>>((acc, networkId) => {
      const params = {
        apiKey: BLOCKNATIVE_API_KEY,
        networkId,
      }
      try {
        acc[networkId] = new BlocknativeSdk({
          dappId: BLOCKNATIVE_API_KEY,
          networkId,
          name: 'bnc_' + networkId,
          onerror: (sdkError: SDKError) => {
            console.log('[blocknative]', sdkError)
            const { sentryError, tags } = constructSentryError(sdkError.error, { message: sdkError.message })
            Sentry.captureException(sentryError, {
              tags,
              contexts: { params },
              extra: { ...sdkError },
            })
          },
        })
      } catch (error: any) {
        console.error('[blocknative] Instantiating BlocknativeSdk failed', error)
        const { sentryError, tags } = constructSentryError(error, { message: 'Instantiating BlocknativeSdk failed' })
        Sentry.captureException(sentryError, {
          tags,
          contexts: { params },
        })
      }

      console.info(`[blocknative] BlocknativeSdk initialized on chain ${networkId}`)

      return acc
    }, {})

function constructSentryError(baseError: unknown, { message }: { message: string }) {
  const constructedError = Object.assign(new Error(), baseError, {
    message,
    name: 'BlocknativeError',
  })

  const tags = {
    errorType: 'blocknative',
  }

  return { baseError, sentryError: constructedError, tags }
}
