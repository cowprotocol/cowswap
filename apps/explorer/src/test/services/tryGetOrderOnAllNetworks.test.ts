import { GetTxOrdersParams } from 'api/operator/types'
import {
  GetOrderApi,
  MultipleOrders,
  tryGetOrderOnAllNetworksAndEnvironments,
} from 'services/helpers/tryGetOrderOnAllNetworks'
import { RAW_ORDER } from '../data'
import { Network } from 'types'

const networkIdSearchListRemaining = [Network.MAINNET, Network.GOERLI]

describe('tryGetOrderOnAllNetworks', () => {
  test('Should consult other networks when the order is empty', async () => {
    const network = Network.GOERLI
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
    const network = Network.GOERLI
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
