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

  it('runs overlapping cancellations one at a time', async () => {
    let finishFirst: (hash: string) => void = () => undefined
    onChainCancelOrder.mockReturnValueOnce(new Promise((resolve) => (finishFirst = resolve)))

    const first = cancelOrder({ config, chainId: 1, orderUid: '0xfirst', type: 'hard' })
    const second = cancelOrder({ config, chainId: 42161, orderUid: '0xsecond', type: 'hard' })

    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(TradingSdk).toHaveBeenCalledTimes(1)
    expect(switchChainMock).not.toHaveBeenCalled()

    finishFirst(TX_HASH)

    await expect(first).resolves.toBe(TX_HASH)
    await expect(second).resolves.toBe(TX_HASH)
    expect(TradingSdk).toHaveBeenCalledTimes(2)
    expect(switchChainMock).toHaveBeenCalledWith(config, { chainId: 42161 })
  })

  it('keeps running cancellations after a failed one', async () => {
    onChainCancelOrder.mockRejectedValueOnce(new Error('rejected'))

    await expect(cancelOrder({ config, chainId: 1, orderUid: ORDER_UID, type: 'hard' })).rejects.toThrow('rejected')
    await expect(cancelOrder({ config, chainId: 1, orderUid: ORDER_UID, type: 'hard' })).resolves.toBe(TX_HASH)
  })
})
