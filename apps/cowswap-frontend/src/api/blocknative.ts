import { isProdLike } from '@cowprotocol/common-utils'
import { ALL_SUPPORTED_CHAIN_IDS, SupportedChainId } from '@cowprotocol/cow-sdk'

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
  console[isProdLike ? 'error' : 'log'](
    '[blocknative] Missing BLOCKNATIVE_API_KEY environment variable. Detection of Cancelations/Replacement of tx will be disabled'
  )
  if (isProdLike) {
    const { sentryError, tags } = constructSentryError(new Error(), { message: 'Blocknative API key not set' })
    Sentry.captureException(sentryError, {
      tags,
    })
  }
}

export const sdk = !BLOCKNATIVE_API_KEY
  ? {}
  : ALL_SUPPORTED_CHAIN_IDS.reduce<Record<number, BlocknativeSdk | null>>((acc, networkId) => {
      const sdk = getBlockNativeSdk(networkId, BLOCKNATIVE_API_KEY)
      if (sdk) {
        acc[networkId] = sdk
      }
      return acc
    }, {})

function getBlockNativeSdk(networkId: SupportedChainId, apiKey: string): BlocknativeSdk | undefined {
  console.log('[blocknative] Instantiating BlocknativeSdk for network', networkId)
  const params = { networkId }
  try {
    const sdk = new BlocknativeSdk({
      dappId: apiKey,
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
    return sdk
  } catch (error: any) {
    console.error('[blocknative] Instantiating BlocknativeSdk failed', error)
    const { sentryError, tags } = constructSentryError(error, { message: 'Instantiating BlocknativeSdk failed' })
    Sentry.captureException(sentryError, {
      tags,
      contexts: { params },
    })

    return undefined
  }
}

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
