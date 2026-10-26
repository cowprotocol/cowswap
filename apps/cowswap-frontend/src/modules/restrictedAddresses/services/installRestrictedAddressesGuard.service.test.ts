import { encodeFunctionData, parseAbi } from 'viem'

import { captureError } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { PERMIT_ACCOUNT } from '@cowprotocol/permit-utils'
import { COW_SHED_2_1_0_VERSION, COW_SHED_FACTORY } from '@cowprotocol/sdk-cow-shed'
import { setWalletTransactionGuard, type WalletTransactionGuard } from '@cowprotocol/wallet'

import { orderBookApi } from 'cowSdk'

import { installRestrictedAddressesGuard } from './installRestrictedAddressesGuard.service'

jest.mock('@cowprotocol/common-utils', () => ({
  ...jest.requireActual('@cowprotocol/common-utils'),
  captureError: jest.fn(),
}))

jest.mock('@cowprotocol/wallet', () => ({ setWalletTransactionGuard: jest.fn() }))

const mockSendOrder = jest.fn()
const mockUploadAppData = jest.fn()

jest.mock('cowSdk', () => {
  const api = {
    context: { chainId: 1 },
    sendOrder: (...args: unknown[]) => mockSendOrder(...args),
    uploadAppData: (...args: unknown[]) => mockUploadAppData(...args),
  }

  return { ...jest.requireActual('cowSdk'), orderBookApi: api, prodOrderBookApi: api }
})

const USER = '0x1111111111111111111111111111111111111111'
const OTHER_USER = '0x2222222222222222222222222222222222222222'
const RESTRICTED = PERMIT_ACCOUNT.address

const COW_SHED_FACTORY_ABI = parseAbi([
  'function executeHooks((address target, uint256 value, bytes callData, bool allowFailure, bool isDelegateCall)[] calls, bytes32 nonce, uint256 deadline, address user, bytes signature)',
])

type OrderBody = Parameters<typeof orderBookApi.sendOrder>[0]

function getCowShedHookAppData(user: string): string {
  const callData = encodeFunctionData({
    abi: COW_SHED_FACTORY_ABI,
    functionName: 'executeHooks',
    args: [[], `0x${'00'.repeat(32)}`, 0n, user as `0x${string}`, '0x'],
  })

  return JSON.stringify({
    metadata: { hooks: { post: [{ target: COW_SHED_FACTORY[COW_SHED_2_1_0_VERSION], callData, gasLimit: '0' }] } },
  })
}

function getOrder(overrides: Partial<OrderBody>): OrderBody {
  return { from: USER, receiver: USER, appData: '{}', ...overrides } as OrderBody
}

describe('installRestrictedAddressesGuard', () => {
  let transactionGuard: WalletTransactionGuard

  beforeAll(() => {
    installRestrictedAddressesGuard()
    transactionGuard = jest.mocked(setWalletTransactionGuard).mock.calls[0][0] as WalletTransactionGuard
  })

  beforeEach(() => {
    jest.mocked(captureError).mockClear()
    mockSendOrder.mockReset().mockResolvedValue('order-id')
    mockUploadAppData.mockReset().mockResolvedValue({})
  })

  describe('orders', () => {
    it.each([
      ['owner', { from: RESTRICTED }],
      ['receiver', { receiver: RESTRICTED }],
      ['appData hooks', { appData: JSON.stringify({ metadata: { hooks: { pre: [{ target: RESTRICTED }] } } }) }],
    ])('blocks an order with a restricted %s', async (_, overrides) => {
      await expect(orderBookApi.sendOrder(getOrder(overrides))).rejects.toThrow('restricted address')

      expect(mockSendOrder).not.toHaveBeenCalled()
      expect(captureError).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'RestrictedAddressError' }),
        undefined,
        expect.objectContaining({ restrictedAddress: RESTRICTED, chainId: SupportedChainId.MAINNET }),
        { errorType: 'restrictedAddress' },
      )
    })

    it('posts an order without restricted addresses', async () => {
      await expect(orderBookApi.sendOrder(getOrder({}))).resolves.toBe('order-id')

      expect(captureError).not.toHaveBeenCalled()
    })

    it('blocks an order with a CoW Shed hook signed for another account', async () => {
      const order = getOrder({ appData: getCowShedHookAppData(OTHER_USER) })

      await expect(orderBookApi.sendOrder(order)).rejects.toThrow(
        'An error has occurred. Please refresh the quote and try again.',
      )

      expect(mockSendOrder).not.toHaveBeenCalled()
      expect(captureError).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'RestrictedAddressError' }),
        undefined,
        expect.objectContaining({ hookUser: OTHER_USER, from: USER }),
        { errorType: 'restrictedAddress' },
      )
    })

    it('posts an order with a CoW Shed hook signed for the owner', async () => {
      const order = getOrder({ appData: getCowShedHookAppData(USER) })

      await expect(orderBookApi.sendOrder(order)).resolves.toBe('order-id')

      expect(captureError).not.toHaveBeenCalled()
    })

    it('blocks uploading an appData document with a restricted address', async () => {
      const appData = JSON.stringify({ metadata: { hooks: { post: [{ target: RESTRICTED }] } } })

      await expect(orderBookApi.uploadAppData('0x01', appData)).rejects.toThrow('restricted address')

      expect(mockUploadAppData).not.toHaveBeenCalled()
    })
  })

  describe('transactions', () => {
    it('blocks a transaction with a restricted address in calldata', () => {
      const data = `0xa9059cbb000000000000000000000000${RESTRICTED.slice(2)}`

      expect(() => transactionGuard([{ from: USER, to: USER, data }], SupportedChainId.MAINNET)).toThrow(
        'An error has occurred. Please refresh the page and try again.',
      )
      expect(captureError).toHaveBeenCalledTimes(1)
    })

    it('allows a transaction without restricted addresses', () => {
      expect(() => transactionGuard([{ from: USER, to: USER, data: '0x' }], SupportedChainId.MAINNET)).not.toThrow()
      expect(captureError).not.toHaveBeenCalled()
    })
  })
})
