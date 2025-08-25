import { MetadataApi } from '@cowprotocol/app-data'
import { isBarnBackendEnv } from '@cowprotocol/common-utils'
import { DEFAULT_BACKOFF_OPTIONS, OrderBookApi } from '@cowprotocol/cow-sdk'

const envBaseUrls = process.env.REACT_APP_ORDER_BOOK_URLS && JSON.parse(process.env.REACT_APP_ORDER_BOOK_URLS)

// To manually set the order book URLs in localStorage, you can use the following command in the browser console:
// localStorage.setItem('orderBookUrls', JSON.stringify({ "1":"https://YOUR_HOST", "100":"https://YOUR_HOST" }))
// To clear it, simply run:
// localStorage.removeItem('orderBookUrls')
const localStorageBaseUrls =
  localStorage.getItem('orderBookUrls') && JSON.parse(localStorage.getItem('orderBookUrls') || '{}')

const prodBaseUrls = envBaseUrls || localStorageBaseUrls || undefined

console.log('Order Book URLs:', prodBaseUrls, !!envBaseUrls, !!localStorageBaseUrls)

export const metadataApiSDK = new MetadataApi()
export const orderBookApi = new OrderBookApi({
  env: isBarnBackendEnv ? 'staging' : 'prod',
  ...(prodBaseUrls ? { baseUrls: prodBaseUrls } : undefined),
  backoffOpts: DEFAULT_BACKOFF_OPTIONS,
})
