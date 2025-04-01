import { MetadataApi } from '@cowprotocol/app-data'
import { isBarnBackendEnv } from '@cowprotocol/common-utils'
import { DEFAULT_BACKOFF_OPTIONS, OrderBookApi } from '@cowprotocol/cow-sdk'

const FAILED_FETCH_ERROR = 'Failed to fetch'

const prodBaseUrls = process.env.REACT_APP_ORDER_BOOK_URLS
  ? JSON.parse(process.env.REACT_APP_ORDER_BOOK_URLS)
  : undefined

export const metadataApiSDK = new MetadataApi()
export const orderBookApi = new OrderBookApi({
  env: isBarnBackendEnv ? 'staging' : 'prod',
  ...(prodBaseUrls ? { baseUrls: prodBaseUrls } : undefined),
  backoffOpts: {
    ...DEFAULT_BACKOFF_OPTIONS,
    retry(e: any, attemptNumber: number): boolean | Promise<boolean> {
      // Retry only once when browser is offline
      if (e?.message === FAILED_FETCH_ERROR && attemptNumber > 1) {
        return false
      }

      return DEFAULT_BACKOFF_OPTIONS.retry?.(e, attemptNumber) ?? true
    },
  },
})
