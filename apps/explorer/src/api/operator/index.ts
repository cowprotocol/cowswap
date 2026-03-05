import * as realApi from './operatorApi'
import * as mockApi from './operatorMock'
export * from './types'

const useMock = process.env.MOCK_OPERATOR === 'true'
const api = useMock ? mockApi : realApi

// Re-exporting the result, mocked or not.
// Unfortunately, did not find a way to export
// a mix of mock/real implementations
// without manually naming the exports
export const getOrder: typeof realApi.getOrder = api.getOrder
export const getAccountOrders: typeof realApi.getAccountOrders = api.getAccountOrders
export const getTxOrders: typeof realApi.getTxOrders = api.getTxOrders
export const getTrades: typeof realApi.getTrades = api.getTrades
export const getOrderCompetitionStatus: typeof realApi.getOrderCompetitionStatus = api.getOrderCompetitionStatus
export const getSolverCompetitionByTxHash: typeof realApi.getSolverCompetitionByTxHash =
  api.getSolverCompetitionByTxHash
