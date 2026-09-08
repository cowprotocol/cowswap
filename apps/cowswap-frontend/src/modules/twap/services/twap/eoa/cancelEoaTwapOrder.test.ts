import { decodeFunctionData, type WalletClient } from 'viem'

import { SupportedChainId, type Signer } from '@cowprotocol/cow-sdk'
import { ComposableCoWAbi, GPv2SettlementAbi } from '@cowprotocol/cowswap-abis'

import { EOA_TWAP_ACCOUNT_PROXY_CONFIG, getCowShedHooks } from 'modules/accountProxy'

import { EOA_TWAP_CANCELLATION_GAS_LIMIT, cancelEoaTwapOrder, CancelEoaTwapOrderParams } from './cancelEoaTwapOrder'

jest.mock('modules/accountProxy', () => ({
  EOA_TWAP_ACCOUNT_PROXY_CONFIG: { id: 'twap-account-proxy' },
  getCowShedHooks: jest.fn(),
}))

const composableCowAddress = '0x1111111111111111111111111111111111111111'
const settlementAddress = '0x2222222222222222222222222222222222222222'
const accountAddress = '0x3333333333333333333333333333333333333333'
const factoryAddress = '0x4444444444444444444444444444444444444444'
const orderId = `0x${'11'.repeat(32)}`
const partOrderId = `0x${'22'.repeat(56)}`
const txHash = `0x${'33'.repeat(32)}`

const signCalls = jest.fn().mockResolvedValue('0xsigned')
const encodeExecuteHooksForFactory = jest.fn().mockReturnValue('0xencoded')
const getFactoryAddress = jest.fn().mockReturnValue(factoryAddress)
const sendTransaction = jest.fn().mockResolvedValue(txHash)

const context = {
  chainId: SupportedChainId.GNOSIS_CHAIN,
  composableCowAddress,
  composableCowAbi: ComposableCoWAbi,
  settlementAddress,
  settlementAbi: GPv2SettlementAbi,
  orderId,
  partOrderId,
  signer: {} as Signer,
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
      signCalls,
      encodeExecuteHooksForFactory,
      getFactoryAddress,
    })
  })

  it('authorizes the calls and sends them through the EOA TWAP CoW Shed factory', async () => {
    await expect(cancelEoaTwapOrder(context)).resolves.toBe(txHash)

    const calls = signCalls.mock.calls[0][0]

    expect(calls).toHaveLength(2)
    expect(calls[0]).toMatchObject({ target: composableCowAddress, value: 0n, allowFailure: false })
    expect(calls[1]).toMatchObject({ target: settlementAddress, value: 0n, allowFailure: false })
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
      accountProxyConfig: EOA_TWAP_ACCOUNT_PROXY_CONFIG,
    })
    expect(signCalls).toHaveBeenCalledTimes(1)
    expect(encodeExecuteHooksForFactory).toHaveBeenCalledWith(
      expect.any(Array),
      expect.stringMatching(/^0x[0-9a-f]{64}$/),
      expect.any(BigInt),
      accountAddress,
      '0xsigned',
    )
    expect(sendTransaction).toHaveBeenCalledWith({
      to: factoryAddress,
      data: '0xencoded',
      account: context.walletClient.account,
      chain: context.walletClient.chain,
      gas: EOA_TWAP_CANCELLATION_GAS_LIMIT,
    })
  })

  it('does not send a transaction when the user rejects the authorization', async () => {
    signCalls.mockRejectedValueOnce(new Error('User rejected the request'))

    await expect(cancelEoaTwapOrder(context)).rejects.toThrow('User rejected the request')

    expect(sendTransaction).not.toHaveBeenCalled()
  })
})
