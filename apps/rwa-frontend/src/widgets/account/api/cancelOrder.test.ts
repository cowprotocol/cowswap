import type { Config } from 'wagmi'
import { getConnection, getPublicClient, getWalletClient, switchChain } from 'wagmi/actions'

import { TradingSdk } from '@cowprotocol/cow-sdk'

import { cancelOrder } from './cancelOrder'

jest.mock('wagmi/actions', () => ({
  getConnection: jest.fn(),
  getPublicClient: jest.fn(),
  getWalletClient: jest.fn(),
  switchChain: jest.fn(),
}))

jest.mock('@cowprotocol/sdk-viem-adapter', () => ({ ViemAdapter: jest.fn() }))

jest.mock('@cowprotocol/cow-sdk', () => ({ TradingSdk: jest.fn() }))

const config = {} as Config
const ORDER_UID = '0xuid'
const TX_HASH = '0xhash'

const getConnectionMock = getConnection as jest.Mock
const switchChainMock = switchChain as jest.Mock
const offChainCancelOrder = jest.fn()
const onChainCancelOrder = jest.fn()

describe('cancelOrder', () => {
  beforeEach(() => {
    getConnectionMock.mockReturnValue({ chainId: 1 })
    ;(getPublicClient as jest.Mock).mockReturnValue({})
    ;(getWalletClient as jest.Mock).mockResolvedValue({})
    offChainCancelOrder.mockResolvedValue(true)
    onChainCancelOrder.mockResolvedValue(TX_HASH)
    ;(TradingSdk as jest.Mock).mockImplementation(() => ({ offChainCancelOrder, onChainCancelOrder }))
  })

  afterEach(() => jest.resetAllMocks())

  it('signs an off-chain cancellation for a soft cancel', async () => {
    await expect(cancelOrder({ config, chainId: 1, orderUid: ORDER_UID, type: 'soft' })).resolves.toBe(null)

    expect(TradingSdk).toHaveBeenCalledWith({ chainId: 1, appCode: 'CoW RWA' }, {}, expect.anything())
    expect(offChainCancelOrder).toHaveBeenCalledWith({ orderUid: ORDER_UID })
    expect(onChainCancelOrder).not.toHaveBeenCalled()
    expect(switchChainMock).not.toHaveBeenCalled()
  })

  it('sends a transaction for a hard cancel, on the order network', async () => {
    getConnectionMock.mockReturnValue({ chainId: 42161 })

    await expect(cancelOrder({ config, chainId: 1, orderUid: ORDER_UID, type: 'hard' })).resolves.toBe(TX_HASH)

    expect(switchChainMock).toHaveBeenCalledWith(config, { chainId: 1 })
    expect(onChainCancelOrder).toHaveBeenCalledWith({ orderUid: ORDER_UID })
    expect(offChainCancelOrder).not.toHaveBeenCalled()
  })
})
