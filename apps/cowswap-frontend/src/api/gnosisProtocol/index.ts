import * as realApi from './api'
import * as mockApi from './mock'

export { getIsOrderBookTypedError } from './getIsOrderBookTypedError'

const useMock = process.env.REACT_APP_MOCK === 'true'

// Re-exporting the result, mocked or not.
// Unfortunately, did not find a way to export
// a mix of mock/real implementations
// without manually naming the exports
export const {
  // functions that have a mock
  getProfileData,
  getQuote = realApi.getQuote,
  getOrder = realApi.getOrder,
  getNativePrice = realApi.getNativePrice,
  getTrades = realApi.getTrades,
  getOrders = realApi.getOrders,
  // functions that only have a mock
} = useMock ? { ...mockApi } : { ...realApi }
