import { getWrappedToken } from '@cowprotocol/common-utils'
import { useWalletInfo, WalletInfo } from '@cowprotocol/wallet'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { renderHook } from '@testing-library/react'

import { IsTokenPermittableResult, useGeneratePermitHook, usePermitInfo } from 'modules/permit'
import { TradeType } from 'modules/trade'

import { useGeneratePermitInAdvanceToTrade } from './useGeneratePermitInAdvanceToTrade'

import { useResetApproveProgressModalState, useUpdateApproveProgressModalState } from '../'

jest.mock('@cowprotocol/common-utils', () => ({
  getWrappedToken: jest.fn(),
}))

jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: jest.fn(),
}))

jest.mock('modules/permit', () => ({
  useGeneratePermitHook: jest.fn(),
  usePermitInfo: jest.fn(),
}))

jest.mock('modules/trade', () => ({
  TradeType: {
    SWAP: 'SWAP',
  },
}))

jest.mock('../', () => ({
  useUpdateApproveProgressModalState: jest.fn(),
  useResetApproveProgressModalState: jest.fn(),
}))

const mockGetWrappedToken = getWrappedToken as jest.MockedFunction<typeof getWrappedToken>
const mockUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const mockUseGeneratePermitHook = useGeneratePermitHook as jest.MockedFunction<typeof useGeneratePermitHook>
const mockUsePermitInfo = usePermitInfo as jest.MockedFunction<typeof usePermitInfo>
const mockUseUpdateApproveProgressModalState = useUpdateApproveProgressModalState as jest.MockedFunction<
  typeof useUpdateApproveProgressModalState
>
const mockUseResetApproveProgressModalState = useResetApproveProgressModalState as jest.MockedFunction<
  typeof useResetApproveProgressModalState
>

describe('useGeneratePermitInAdvanceToTrade', () => {
  const mockToken = new Token(1, '0x1234567890123456789012345678901234567890', 18, 'TEST', 'Test Token')
  const mockWrappedToken = new Token(1, '0x0987654321098765432109876543210987654321', 18, 'WETH', 'Wrapped Ether')
  const mockAmountToApprove = CurrencyAmount.fromRawAmount(mockToken, '1000000000000000000') // 1 token
  const mockAccount = '0xabcdef1234567890abcdef1234567890abcdef12'
  const mockPermitInfo = { type: 'eip-2612' as const }
  const mockUpdateApproveProgressModalState = jest.fn()
  const mockResetApproveProgressModalState = jest.fn()

  const mockGeneratePermit = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    mockGetWrappedToken.mockReturnValue(mockWrappedToken as unknown as ReturnType<typeof getWrappedToken>)
    mockUseWalletInfo.mockReturnValue({ account: mockAccount, chainId: 1 } as WalletInfo)
    mockUseGeneratePermitHook.mockReturnValue(mockGeneratePermit)
    mockUsePermitInfo.mockReturnValue(mockPermitInfo)
    mockUseUpdateApproveProgressModalState.mockReturnValue(mockUpdateApproveProgressModalState)
    mockUseResetApproveProgressModalState.mockReturnValue(mockResetApproveProgressModalState)
  })

  describe('hook initialization', () => {
    it('should return a function', () => {
      const { result } = renderHook(() => useGeneratePermitInAdvanceToTrade(mockAmountToApprove))

      expect(typeof result.current).toBe('function')
    })

    it('should call getWrappedToken with the correct currency', () => {
      renderHook(() => useGeneratePermitInAdvanceToTrade(mockAmountToApprove))

      expect(mockGetWrappedToken).toHaveBeenCalledWith(mockAmountToApprove.currency)
    })

    it('should call usePermitInfo with wrapped token and SWAP trade type', () => {
      renderHook(() => useGeneratePermitInAdvanceToTrade(mockAmountToApprove))

      expect(mockUsePermitInfo).toHaveBeenCalledWith(mockWrappedToken, TradeType.SWAP)
    })
  })

  describe('permit generation', () => {
    it('should return false when account is not available', async () => {
      mockUseWalletInfo.mockReturnValue({ account: null, chainId: 1 } as unknown as WalletInfo)
      const { result } = renderHook(() => useGeneratePermitInAdvanceToTrade(mockAmountToApprove))

      const generatePermit = result.current
      const result_value = await generatePermit()

      expect(result_value).toBe(false)
      expect(mockGeneratePermit).not.toHaveBeenCalled()
    })

    it('should return false when permitInfo is not available', async () => {
      mockUsePermitInfo.mockReturnValue(null as unknown as IsTokenPermittableResult)
      const { result } = renderHook(() => useGeneratePermitInAdvanceToTrade(mockAmountToApprove))

      const generatePermit = result.current
      const result_value = await generatePermit()

      expect(result_value).toBe(false)
      expect(mockGeneratePermit).not.toHaveBeenCalled()
    })

    it('should return false when permitInfo is undefined', async () => {
      mockUsePermitInfo.mockReturnValue(undefined)
      const { result } = renderHook(() => useGeneratePermitInAdvanceToTrade(mockAmountToApprove))

      const generatePermit = result.current
      const result_value = await generatePermit()

      expect(result_value).toBe(false)
      expect(mockGeneratePermit).not.toHaveBeenCalled()
    })

    it('should call generatePermit with correct parameters when account and permitInfo are available', async () => {
      const mockPermitData = { signature: '0x123', deadline: 1234567890 }
      mockGeneratePermit.mockResolvedValue(mockPermitData)

      const { result } = renderHook(() => useGeneratePermitInAdvanceToTrade(mockAmountToApprove))

      const generatePermit = result.current
      const result_value = await generatePermit()

      expect(result_value).toBe(true)
      expect(mockGeneratePermit).toHaveBeenCalledWith({
        inputToken: {
          name: mockWrappedToken.name || '',
          address: mockWrappedToken.address,
        },
        account: mockAccount,
        permitInfo: mockPermitInfo,
        amount: BigInt(mockAmountToApprove.quotient.toString()),
        preSignCallback: expect.any(Function),
        postSignCallback: expect.any(Function),
      })
    })

    it('should return false when generatePermit returns null', async () => {
      mockGeneratePermit.mockResolvedValue(null)

      const { result } = renderHook(() => useGeneratePermitInAdvanceToTrade(mockAmountToApprove))

      const generatePermit = result.current
      const result_value = await generatePermit()

      expect(result_value).toBe(false)
    })

    it('should return false when generatePermit returns undefined', async () => {
      mockGeneratePermit.mockResolvedValue(undefined)

      const { result } = renderHook(() => useGeneratePermitInAdvanceToTrade(mockAmountToApprove))

      const generatePermit = result.current
      const result_value = await generatePermit()

      expect(result_value).toBe(false)
    })

    it('should return true when generatePermit returns valid data', async () => {
      const mockPermitData = { signature: '0x123', deadline: 1234567890 }
      mockGeneratePermit.mockResolvedValue(mockPermitData)

      const { result } = renderHook(() => useGeneratePermitInAdvanceToTrade(mockAmountToApprove))

      const generatePermit = result.current
      const result_value = await generatePermit()

      expect(result_value).toBe(true)
    })
  })

  describe('callback functions', () => {
    it('should call preSignCallback with correct parameters', async () => {
      const mockPermitData = { signature: '0x123', deadline: 1234567890 }
      mockGeneratePermit.mockResolvedValue(mockPermitData)

      const { result } = renderHook(() => useGeneratePermitInAdvanceToTrade(mockAmountToApprove))

      const generatePermit = result.current
      await generatePermit()

      // Get the preSignCallback that was passed to generatePermit
      const generatePermitCall = mockGeneratePermit.mock.calls[0][0]
      const preSignCallback = generatePermitCall.preSignCallback

      // Call the preSignCallback
      preSignCallback()

      expect(mockUpdateApproveProgressModalState).toHaveBeenCalledWith({
        currency: mockAmountToApprove.currency,
        approveInProgress: true,
        amountToApprove: mockAmountToApprove,
      })
    })

    it('should call postSignCallback with correct parameters', async () => {
      const mockPermitData = { signature: '0x123', deadline: 1234567890 }
      mockGeneratePermit.mockResolvedValue(mockPermitData)

      const { result } = renderHook(() => useGeneratePermitInAdvanceToTrade(mockAmountToApprove))

      const generatePermit = result.current
      await generatePermit()

      const generatePermitCall = mockGeneratePermit.mock.calls[0][0]
      const postSignCallback = generatePermitCall.postSignCallback

      postSignCallback()

      expect(mockResetApproveProgressModalState).toHaveBeenCalled()
    })
  })

  describe('token handling', () => {
    it('should handle token with name', async () => {
      const tokenWithName = new Token(1, '0x1234567890123456789012345678901234567890', 18, 'TestToken', 'Test Token')
      const wrappedTokenWithName = new Token(
        1,
        '0x0987654321098765432109876543210987654321',
        18,
        'WTestToken',
        'Wrapped Test Token',
      )
      const amountWithNamedToken = CurrencyAmount.fromRawAmount(tokenWithName, '1000000000000000000')

      mockGetWrappedToken.mockReturnValue(wrappedTokenWithName as unknown as ReturnType<typeof getWrappedToken>)
      mockGeneratePermit.mockResolvedValue({ signature: '0x123' })

      const { result } = renderHook(() => useGeneratePermitInAdvanceToTrade(amountWithNamedToken))

      const generatePermit = result.current
      await generatePermit()

      expect(mockGeneratePermit).toHaveBeenCalledWith(
        expect.objectContaining({
          inputToken: {
            name: 'Wrapped Test Token',
            address: wrappedTokenWithName.address,
          },
        }),
      )
    })

    it('should handle token without name', async () => {
      const tokenWithoutName = new Token(1, '0x1234567890123456789012345678901234567890', 18, '', '')
      const wrappedTokenWithoutName = new Token(1, '0x0987654321098765432109876543210987654321', 18, '', '')
      const amountWithUnnamedToken = CurrencyAmount.fromRawAmount(tokenWithoutName, '1000000000000000000')

      mockGetWrappedToken.mockReturnValue(wrappedTokenWithoutName as unknown as ReturnType<typeof getWrappedToken>)
      mockGeneratePermit.mockResolvedValue({ signature: '0x123' })

      const { result } = renderHook(() => useGeneratePermitInAdvanceToTrade(amountWithUnnamedToken))

      const generatePermit = result.current
      await generatePermit()

      expect(mockGeneratePermit).toHaveBeenCalledWith(
        expect.objectContaining({
          inputToken: {
            name: '',
            address: wrappedTokenWithoutName.address,
          },
        }),
      )
    })
  })

  describe('amount handling', () => {
    it('should convert amount to BigInt correctly', async () => {
      const largeAmount = CurrencyAmount.fromRawAmount(mockToken, '1000000000000000000000') // 1000 tokens
      mockGeneratePermit.mockResolvedValue({ signature: '0x123' })

      const { result } = renderHook(() => useGeneratePermitInAdvanceToTrade(largeAmount))

      const generatePermit = result.current
      await generatePermit()

      expect(mockGeneratePermit).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: BigInt('1000000000000000000000'),
        }),
      )
    })

    it('should handle zero amount', async () => {
      const zeroAmount = CurrencyAmount.fromRawAmount(mockToken, '0')
      mockGeneratePermit.mockResolvedValue({ signature: '0x123' })

      const { result } = renderHook(() => useGeneratePermitInAdvanceToTrade(zeroAmount))

      const generatePermit = result.current
      await generatePermit()

      expect(mockGeneratePermit).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: BigInt('0'),
        }),
      )
    })
  })

  describe('error handling', () => {
    it('should handle generatePermit throwing an error', async () => {
      const error = new Error('Permit generation failed')
      mockGeneratePermit.mockRejectedValue(error)

      const { result } = renderHook(() => useGeneratePermitInAdvanceToTrade(mockAmountToApprove))

      const generatePermit = result.current

      await expect(generatePermit()).rejects.toThrow('Permit generation failed')
    })

    it('should handle generatePermit returning empty object', async () => {
      mockGeneratePermit.mockResolvedValue({})

      const { result } = renderHook(() => useGeneratePermitInAdvanceToTrade(mockAmountToApprove))

      const generatePermit = result.current
      const result_value = await generatePermit()

      expect(result_value).toBe(true) // Empty object is truthy
    })
  })

  describe('hook dependencies', () => {
    it('should recreate callback when account changes', () => {
      const { result, rerender } = renderHook(() => useGeneratePermitInAdvanceToTrade(mockAmountToApprove))
      const firstCallback = result.current

      mockUseWalletInfo.mockReturnValue({ account: '0xnewaccount', chainId: 1 } as WalletInfo)
      rerender()
      const secondCallback = result.current

      expect(firstCallback).not.toBe(secondCallback)
    })

    it('should recreate callback when amountToApprove changes', () => {
      const { result, rerender } = renderHook(({ amount }) => useGeneratePermitInAdvanceToTrade(amount), {
        initialProps: { amount: mockAmountToApprove },
      })
      const firstCallback = result.current

      const newAmount = CurrencyAmount.fromRawAmount(mockToken, '2000000000000000000')
      rerender({ amount: newAmount })
      const secondCallback = result.current

      expect(firstCallback).not.toBe(secondCallback)
    })

    it('should recreate callback when permitInfo changes', () => {
      const { result, rerender } = renderHook(() => useGeneratePermitInAdvanceToTrade(mockAmountToApprove))
      const firstCallback = result.current

      mockUsePermitInfo.mockReturnValue({ type: 'dai-like' as const })
      rerender()
      const secondCallback = result.current

      expect(firstCallback).not.toBe(secondCallback)
    })

    it('should recreate callback when updateApproveProgressModalState changes', () => {
      const { result, rerender } = renderHook(() => useGeneratePermitInAdvanceToTrade(mockAmountToApprove))
      const firstCallback = result.current

      const newUpdateFunction = jest.fn()
      mockUseUpdateApproveProgressModalState.mockReturnValue(newUpdateFunction)
      rerender()
      const secondCallback = result.current

      expect(firstCallback).not.toBe(secondCallback)
    })

    it('should recreate callback when resetApproveProgressModalState changes', () => {
      const { result, rerender } = renderHook(() => useGeneratePermitInAdvanceToTrade(mockAmountToApprove))
      const firstCallback = result.current

      const newResetFunction = jest.fn()
      mockUseResetApproveProgressModalState.mockReturnValue(newResetFunction)
      rerender()
      const secondCallback = result.current

      expect(firstCallback).not.toBe(secondCallback)
    })
  })

  describe('integration scenarios', () => {
    it('should handle complete permit generation flow', async () => {
      const mockPermitData = {
        signature: '0xabcdef1234567890',
        deadline: 1234567890,
        nonce: 42,
      }
      mockGeneratePermit.mockResolvedValue(mockPermitData)

      const { result } = renderHook(() => useGeneratePermitInAdvanceToTrade(mockAmountToApprove))

      const generatePermit = result.current
      const result_value = await generatePermit()

      expect(result_value).toBe(true)
      expect(mockGeneratePermit).toHaveBeenCalledTimes(1)
      expect(mockUpdateApproveProgressModalState).toHaveBeenCalledTimes(0)
    })

    it('should handle permit generation with callbacks', async () => {
      const mockPermitData = { signature: '0x123' }
      mockGeneratePermit.mockResolvedValue(mockPermitData)

      const { result } = renderHook(() => useGeneratePermitInAdvanceToTrade(mockAmountToApprove))

      const generatePermit = result.current
      await generatePermit()

      const generatePermitCall = mockGeneratePermit.mock.calls[0][0]

      generatePermitCall.preSignCallback()
      expect(mockUpdateApproveProgressModalState).toHaveBeenCalledWith({
        currency: mockAmountToApprove.currency,
        approveInProgress: true,
        amountToApprove: mockAmountToApprove,
      })

      generatePermitCall.postSignCallback()
      expect(mockResetApproveProgressModalState).toHaveBeenCalled()
    })
  })
})
