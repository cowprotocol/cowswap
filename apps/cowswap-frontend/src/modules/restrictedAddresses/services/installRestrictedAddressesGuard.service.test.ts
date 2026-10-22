import { captureError } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { PERMIT_ACCOUNT } from '@cowprotocol/permit-utils'
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
const RESTRICTED = PERMIT_ACCOUNT.address

type OrderBody = Parameters<typeof orderBookApi.sendOrder>[0]

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
        'restricted address',
      )
      expect(captureError).toHaveBeenCalledTimes(1)
    })

    it('allows a transaction without restricted addresses', () => {
      expect(() => transactionGuard([{ from: USER, to: USER, data: '0x' }], SupportedChainId.MAINNET)).not.toThrow()
      expect(captureError).not.toHaveBeenCalled()
    })
  })
})
