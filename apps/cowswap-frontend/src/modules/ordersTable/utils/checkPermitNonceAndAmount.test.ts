import { checkIsCallDataAValidPermit, getPermitUtilsInstance, PermitInfo } from '@cowprotocol/permit-utils'

import { Order } from 'legacy/state/orders/actions'

import { checkPermitNonceAndAmount } from './checkPermitNonceAndAmount'
import { extractPermitData } from './extractPermitData'

import type { Eip2612PermitUtils } from '@1inch/permit-signed-approvals-utils'
import type { PublicClient } from 'viem'

jest.mock('@cowprotocol/permit-utils', () => ({
  checkIsCallDataAValidPermit: jest.fn(),
  getPermitUtilsInstance: jest.fn(),
}))

jest.mock('./extractPermitData', () => ({
  extractPermitData: jest.fn(),
}))

const mockCheckIsCallDataAValidPermit = checkIsCallDataAValidPermit as jest.MockedFunction<
  typeof checkIsCallDataAValidPermit
>
const mockGetPermitUtilsInstance = getPermitUtilsInstance as jest.MockedFunction<typeof getPermitUtilsInstance>
const mockExtractPermitData = extractPermitData as jest.MockedFunction<typeof extractPermitData>

// Type for the permit utils instance
interface PermitUtilsInstance {
  getTokenNonce: jest.MockedFunction<(tokenAddress: string, account: string) => Promise<number>>
}

describe('checkPermitNonceAndAmount', () => {
  const mockAccount = '0x1234567890123456789012345678901234567890'
  const mockChainId = 1
  const mockClient = {} as PublicClient
  const mockOrder: Order = {
    id: 'test-order-id',
    sellToken: '0x1234567890123456789012345678901234567890',
    sellAmount: '1000000000000000000', // 1 ETH
    inputToken: {
      name: 'Test Token',
      symbol: 'TEST',
      address: '0x1234567890123456789012345678901234567890',
      chainId: 1,
      decimals: 18,
      isNative: false,
      isToken: true,
    },
  } as Order
  const mockPermitCallData = '0xd505accf' + '0'.repeat(512)
  const mockPermitInfo: PermitInfo = { type: 'eip-2612' as const }

  const mockEip2612Utils: PermitUtilsInstance = {
    getTokenNonce: jest.fn() as jest.MockedFunction<(tokenAddress: string, account: string) => Promise<number>>,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetPermitUtilsInstance.mockResolvedValue(mockEip2612Utils as unknown as Eip2612PermitUtils)
  })

  describe('DAI-like permits', () => {
    it('should return true when nonce is valid', async () => {
      mockExtractPermitData.mockReturnValue({
        permitNonce: BigInt('5'),
        permitAmount: BigInt('1000000000000000000'),
        permitType: 'dai-like',
      })
      mockEip2612Utils.getTokenNonce.mockResolvedValue(3) // Current nonce is 3, permit nonce is 5

      const result = await checkPermitNonceAndAmount(
        mockAccount,
        mockChainId,
        mockClient,
        mockOrder,
        mockPermitCallData,
        mockPermitInfo,
      )

      expect(result).toBe(true)
      expect(mockEip2612Utils.getTokenNonce).toHaveBeenCalledWith(mockOrder.sellToken, mockAccount)
    })

    it('should return false when nonce is invalid', async () => {
      mockExtractPermitData.mockReturnValue({
        permitNonce: BigInt('3'),
        permitAmount: BigInt('1000000000000000000'),
        permitType: 'dai-like',
      })
      mockEip2612Utils.getTokenNonce.mockResolvedValue(5) // Current nonce is 5, permit nonce is 3

      const result = await checkPermitNonceAndAmount(
        mockAccount,
        mockChainId,
        mockClient,
        mockOrder,
        mockPermitCallData,
        mockPermitInfo,
      )

      expect(result).toBe(false)
    })

    it('should return true when permit amount is sufficient', async () => {
      mockExtractPermitData.mockReturnValue({
        permitNonce: BigInt('5'),
        permitAmount: BigInt('2000000000000000000'), // 2 ETH, more than order amount
        permitType: 'dai-like',
      })
      mockEip2612Utils.getTokenNonce.mockResolvedValue(3)

      const result = await checkPermitNonceAndAmount(
        mockAccount,
        mockChainId,
        mockClient,
        mockOrder,
        mockPermitCallData,
        mockPermitInfo,
      )

      expect(result).toBe(true)
    })

    it('should return false when permit amount is insufficient', async () => {
      mockExtractPermitData.mockReturnValue({
        permitNonce: BigInt('5'),
        permitAmount: BigInt('500000000000000000'), // 0.5 ETH, less than order amount
        permitType: 'dai-like',
      })
      mockEip2612Utils.getTokenNonce.mockResolvedValue(3)

      const result = await checkPermitNonceAndAmount(
        mockAccount,
        mockChainId,
        mockClient,
        mockOrder,
        mockPermitCallData,
        mockPermitInfo,
      )

      expect(result).toBe(false)
    })
  })

  describe('EIP-2612 permits', () => {
    it('should return true when permit is valid', async () => {
      mockExtractPermitData.mockReturnValue({
        permitNonce: null,
        permitAmount: BigInt('1000000000000000000'),
        permitType: 'eip-2612',
      })
      mockCheckIsCallDataAValidPermit.mockResolvedValue(true)

      const result = await checkPermitNonceAndAmount(
        mockAccount,
        mockChainId,
        mockClient,
        mockOrder,
        mockPermitCallData,
        mockPermitInfo,
      )

      expect(result).toBe(true)
      expect(mockCheckIsCallDataAValidPermit).toHaveBeenCalledWith(
        mockAccount,
        mockChainId,
        mockEip2612Utils,
        mockOrder.sellToken,
        mockOrder.inputToken.name,
        mockPermitCallData,
        mockPermitInfo,
      )
    })

    it('should return false when permit is invalid', async () => {
      mockExtractPermitData.mockReturnValue({
        permitNonce: null,
        permitAmount: BigInt('1000000000000000000'),
        permitType: 'eip-2612',
      })
      mockCheckIsCallDataAValidPermit.mockResolvedValue(false)

      const result = await checkPermitNonceAndAmount(
        mockAccount,
        mockChainId,
        mockClient,
        mockOrder,
        mockPermitCallData,
        mockPermitInfo,
      )

      expect(result).toBe(false)
    })

    it('should return false when permit validation throws error', async () => {
      mockExtractPermitData.mockReturnValue({
        permitNonce: null,
        permitAmount: BigInt('1000000000000000000'),
        permitType: 'eip-2612',
      })
      mockCheckIsCallDataAValidPermit.mockRejectedValue(new Error('Validation failed'))

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const result = await checkPermitNonceAndAmount(
        mockAccount,
        mockChainId,
        mockClient,
        mockOrder,
        mockPermitCallData,
        mockPermitInfo,
      )

      expect(result).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith('Error validating EIP-2612 permit:', expect.any(Error))

      consoleSpy.mockRestore()
    })
  })

  describe('amount validation', () => {
    it('should return undefined when permit amount is null', async () => {
      mockExtractPermitData.mockReturnValue({
        permitNonce: BigInt('5'),
        permitAmount: null,
        permitType: 'dai-like',
      })
      mockEip2612Utils.getTokenNonce.mockResolvedValue(3)

      const result = await checkPermitNonceAndAmount(
        mockAccount,
        mockChainId,
        mockClient,
        mockOrder,
        mockPermitCallData,
        mockPermitInfo,
      )

      expect(result).toBeUndefined()
    })
  })

  describe('error handling', () => {
    it('should return false when getPermitUtilsInstance throws error', async () => {
      mockGetPermitUtilsInstance.mockImplementation(() => {
        throw new Error('Provider error')
      })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const result = await checkPermitNonceAndAmount(
        mockAccount,
        mockChainId,
        mockClient,
        mockOrder,
        mockPermitCallData,
        mockPermitInfo,
      )

      expect(result).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith('Error checking permit nonce and amount:', expect.any(Error))

      consoleSpy.mockRestore()
    })

    it('should return false when getTokenNonce throws error', async () => {
      mockExtractPermitData.mockReturnValue({
        permitNonce: BigInt('5'),
        permitAmount: BigInt('1000000000000000000'),
        permitType: 'dai-like',
      })
      mockEip2612Utils.getTokenNonce.mockRejectedValue(new Error('Network error'))

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const result = await checkPermitNonceAndAmount(
        mockAccount,
        mockChainId,
        mockClient,
        mockOrder,
        mockPermitCallData,
        mockPermitInfo,
      )

      expect(result).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith('Error checking permit nonce and amount:', expect.any(Error))

      consoleSpy.mockRestore()
    })
  })
})
