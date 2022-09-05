import BlocknativeSdk from 'bnc-sdk'
import * as Sentry from '@sentry/browser'
import { getSupportedChainIds } from 'connection'

const BLOCKNATIVE_API_KEY = process.env.REACT_APP_BLOCKNATIVE_API_KEY

interface SDKError {
  message: string
  error?: any
  account?: string
  transaction?: string
}

if (!BLOCKNATIVE_API_KEY) {
  console.warn('[blocknative] Missing BLOCKNATIVE_API_KEY')
  Sentry.captureException(new Error('Blocknative API key not set'), {
    tags: { errorType: 'blocknative' },
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
          onerror: (error: SDKError) => {
            console.log('[blocknative]', error)
            Sentry.captureException(error, {
              tags: { errorType: 'blocknative' },
              contexts: { params },
            })
          },
        })
      } catch (error) {
        console.error('[blocknative] Instantiating BlocknativeSdk failed', error)
        Sentry.captureException(error, {
          tags: { errorType: 'blocknative' },
          contexts: { params },
        })
      }

      console.info(`[blocknative] BlocknativeSdk initialized on chain ${networkId}`)

      return acc
    }, {})
