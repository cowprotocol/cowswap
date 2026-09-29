import {
  GetOrderApi,
  MultipleOrders,
  tryGetOrderOnAllNetworksAndEnvironments,
} from 'services/helpers/tryGetOrderOnAllNetworks'
import { Network } from 'types'
import { getChainsForOrderId } from 'utils'

import { GetTxOrdersParams } from 'api/operator/types'

import { RAW_ORDER } from '../data'

const networkIdSearchListRemaining = [Network.MAINNET, Network.SEPOLIA]

describe('tryGetOrderOnAllNetworks', () => {
  test('Should consult other networks when the order is empty', async () => {
    const network = Network.SEPOLIA
    const txHash = '0xTest_txHash'
    const defaultParams: GetTxOrdersParams = { networkId: network, txHash }
    const mockedApi = jest.fn().mockImplementation(() => Promise.resolve(null))

    const getOrderApi: GetOrderApi<GetTxOrdersParams, MultipleOrders> = {
      api: mockedApi,
      defaultParams,
    }
    const result = await tryGetOrderOnAllNetworksAndEnvironments(network, getOrderApi, networkIdSearchListRemaining)

    expect(mockedApi).toHaveBeenLastCalledWith({ networkId: Network.MAINNET, txHash })
    expect(result).toEqual({ order: null })
  })
  test('Should return and not call other networks when encountered', async () => {
    const network = Network.SEPOLIA
    const txHash = '0xTest_txHash'
    const ordersResult = [RAW_ORDER]
    const defaultParams: GetTxOrdersParams = { networkId: network, txHash }
    const mockedApi = jest.fn().mockImplementation(() => Promise.resolve(ordersResult))

    const getOrderApi: GetOrderApi<GetTxOrdersParams, MultipleOrders> = {
      api: mockedApi,
      defaultParams,
    }
    const result = await tryGetOrderOnAllNetworksAndEnvironments(network, getOrderApi, networkIdSearchListRemaining)

    expect(mockedApi).not.toHaveBeenCalledWith({ networkId: Network.MAINNET, txHash })
    expect(result).toEqual({ order: ordersResult })
  })
})

// Uids are chain-shaped, so an order can only ever live on one family — but which one is decided by
// the id, not by the chain being viewed, so a search from anywhere can still find and redirect to it.
describe('getChainsForOrderId', () => {
  const SOLANA_ORDER_ID = '0x7dcc25777cc80edcf5dcbb2d3a78df351a2e61eee9cf0373727a11452f26917f'
  const EVM_ORDER_ID =
    '0xeaeb698c973f691c702fdd6aacd09ea97acb7275ae26adbfdd884abda1d6697db6bad41ae76a11d10f7b0e664c5007b908bc77c9618b4c31'

  it('offers only Solana for a Solana uid', () => {
    expect(getChainsForOrderId(SOLANA_ORDER_ID)).toEqual([Network.SOLANA])
  })

  it('offers every EVM chain but not Solana for an EVM uid', () => {
    const chains = getChainsForOrderId(EVM_ORDER_ID)

    expect(chains).toContain(Network.MAINNET)
    expect(chains).not.toContain(Network.SOLANA)
  })

  it('offers nothing for a string that is neither', () => {
    expect(getChainsForOrderId('0xdeadbeef')).toEqual([])
  })
})
