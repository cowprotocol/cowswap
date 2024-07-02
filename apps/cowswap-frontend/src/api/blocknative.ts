import { ALL_SUPPORTED_CHAIN_IDS } from '@cowprotocol/cow-sdk'

import * as Sentry from '@sentry/browser'
import BlocknativeSdk from 'bnc-sdk'

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

const BLOCKNATIVE_ERRORS_TO_IGNORE = /WebSocket error/

export const sdk = !BLOCKNATIVE_API_KEY
  ? {}
  : ALL_SUPPORTED_CHAIN_IDS.reduce<Record<number, BlocknativeSdk | null>>((acc, networkId) => {
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

            if (!BLOCKNATIVE_ERRORS_TO_IGNORE.test(sdkError.message)) {
              const { sentryError, tags } = constructSentryError(sdkError.error, { message: sdkError.message })
              Sentry.captureException(sentryError, {
                tags,
                contexts: { params },
                extra: { ...sdkError },
              })
            }
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
