import { decodeFunctionData, parseAbi, type Hex, type WalletClient } from 'viem'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ComposableCoWAbi, GPv2SettlementAbi } from '@cowprotocol/cowswap-abis'

import { ADVANCED_ORDERS_ACCOUNT_PROXY_CONFIG, getCowShedHooks } from 'modules/accountProxy'

import { EOA_TWAP_CANCELLATION_GAS_LIMIT, cancelEoaTwapOrder, CancelEoaTwapOrderParams } from './cancelEoaTwapOrder'

jest.mock('modules/accountProxy', () => ({
  ADVANCED_ORDERS_ACCOUNT_PROXY_CONFIG: { id: 'twap-account-proxy' },
  getCowShedHooks: jest.fn(),
}))

const composableCowAddress = '0x1111111111111111111111111111111111111111'
const settlementAddress = '0x2222222222222222222222222222222222222222'
const accountAddress = '0x3333333333333333333333333333333333333333'
const proxyAddress = '0x4444444444444444444444444444444444444444'
const orderId = `0x${'11'.repeat(32)}`
const partOrderId = `0x${'22'.repeat(56)}`
const txHash = `0x${'33'.repeat(32)}`

const proxyOf = jest.fn().mockReturnValue(proxyAddress)
const sendTransaction = jest.fn<Promise<Hex>, [{ data: Hex }]>().mockResolvedValue(txHash as Hex)
const trustedExecuteAbi = parseAbi([
  'function trustedExecuteHooks((address target, uint256 value, bytes callData, bool allowFailure, bool isDelegateCall)[] calls)',
])

const context = {
  chainId: SupportedChainId.GNOSIS_CHAIN,
  composableCowAddress,
  composableCowAbi: ComposableCoWAbi,
  settlementAddress,
  settlementAbi: GPv2SettlementAbi,
  orderId,
  partOrderId,
  walletClient: {
    account: { address: accountAddress },
    chain: { id: SupportedChainId.GNOSIS_CHAIN },
    sendTransaction,
  } as unknown as WalletClient,
} satisfies CancelEoaTwapOrderParams

describe('cancelEoaTwapOrder', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(getCowShedHooks as jest.Mock).mockReturnValue({
      proxyOf,
    })
  })

  it('cancels the parent and active slice through the proxy in one transaction', async () => {
    await expect(cancelEoaTwapOrder(context)).resolves.toBe(txHash)

    expect(sendTransaction).toHaveBeenCalledTimes(1)
    const {
      functionName,
      args: [calls],
    } = decodeFunctionData({
      abi: trustedExecuteAbi,
      data: sendTransaction.mock.calls[0][0].data,
    })
    expect(functionName).toBe('trustedExecuteHooks')

    expect(calls).toHaveLength(2)
    expect(calls[0]).toMatchObject({
      target: composableCowAddress,
      value: 0n,
      allowFailure: false,
      isDelegateCall: false,
    })
    expect(calls[1]).toMatchObject({ target: settlementAddress, value: 0n, allowFailure: false, isDelegateCall: false })
    expect(decodeFunctionData({ abi: ComposableCoWAbi, data: calls[0].callData })).toEqual({
      functionName: 'remove',
      args: [orderId],
    })
    expect(decodeFunctionData({ abi: GPv2SettlementAbi, data: calls[1].callData })).toEqual({
      functionName: 'invalidateOrder',
      args: [partOrderId],
    })

    expect(getCowShedHooks).toHaveBeenCalledWith({
      chainId: SupportedChainId.GNOSIS_CHAIN,
      accountProxyConfig: ADVANCED_ORDERS_ACCOUNT_PROXY_CONFIG,
    })
    expect(proxyOf).toHaveBeenCalledWith(accountAddress)
    expect(sendTransaction).toHaveBeenCalledWith({
      to: proxyAddress,
      data: expect.any(String),
      account: context.walletClient.account,
      chain: context.walletClient.chain,
      gas: EOA_TWAP_CANCELLATION_GAS_LIMIT,
    })
  })

  it('propagates rejection when the user rejects the transaction', async () => {
    const error = Object.assign(new Error('User rejected the request'), { code: 4001 })
    sendTransaction.mockRejectedValueOnce(error)

    await expect(cancelEoaTwapOrder(context)).rejects.toBe(error)

    expect(sendTransaction).toHaveBeenCalledTimes(1)
  })

  it('invalidates only the selected part through the Shed without removing the parent', async () => {
    await expect(cancelEoaTwapOrder({ ...context, partOnly: true })).resolves.toBe(txHash)

    const {
      functionName,
      args: [calls],
    } = decodeFunctionData({
      abi: trustedExecuteAbi,
      data: sendTransaction.mock.calls[0][0].data,
    })
    expect(functionName).toBe('trustedExecuteHooks')
    expect(sendTransaction).toHaveBeenCalledTimes(1)
    expect(calls).toHaveLength(1)
    expect(calls[0]).toMatchObject({ target: settlementAddress, value: 0n, allowFailure: false })
    expect(decodeFunctionData({ abi: GPv2SettlementAbi, data: calls[0].callData })).toEqual({
      functionName: 'invalidateOrder',
      args: [partOrderId],
    })
    expect(sendTransaction).toHaveBeenCalledWith(expect.objectContaining({ to: proxyAddress }))
  })

  it('rejects part-only cancellation without a UID before sending', async () => {
    await expect(cancelEoaTwapOrder({ ...context, partOnly: true, partOrderId: undefined })).rejects.toThrow(
      'A part order UID is required',
    )
    expect(sendTransaction).not.toHaveBeenCalled()
  })
})
