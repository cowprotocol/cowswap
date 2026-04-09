import { useTradeSpenderAddress } from '@cowprotocol/balances-and-allowances'
import { CurrencyAmount, Token } from '@cowprotocol/currency'
import { useWalletInfo } from '@cowprotocol/wallet'

import { renderHook, waitFor } from '@testing-library/react'

import { useTradeApproveCallback } from 'modules/erc20Approve'
import { callWidgetHook } from 'modules/injectedWidget'
import { useShouldZeroApprove, useZeroApprove } from 'modules/zeroApproval'

import { useApproveCurrency } from './useApproveCurrency'

jest.mock('@cowprotocol/balances-and-allowances', () => ({
  useTradeSpenderAddress: jest.fn(),
}))

jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: jest.fn(),
}))

jest.mock('modules/erc20Approve', () => ({
  useTradeApproveCallback: jest.fn(),
}))

jest.mock('modules/injectedWidget', () => ({
  callWidgetHook: jest.fn(),
}))

jest.mock('modules/zeroApproval', () => ({
  useShouldZeroApprove: jest.fn(),
  useZeroApprove: jest.fn(),
}))

const mockUseTradeSpenderAddress = useTradeSpenderAddress as jest.MockedFunction<typeof useTradeSpenderAddress>
const mockUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const mockUseTradeApproveCallback = useTradeApproveCallback as jest.MockedFunction<typeof useTradeApproveCallback>
const mockCallWidgetHook = callWidgetHook as jest.MockedFunction<typeof callWidgetHook>
const mockUseShouldZeroApprove = useShouldZeroApprove as jest.MockedFunction<typeof useShouldZeroApprove>
const mockUseZeroApprove = useZeroApprove as jest.MockedFunction<typeof useZeroApprove>

describe('useApproveCurrency', () => {
  const mockToken = new Token(1, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 18, 'TEST', 'Test Token')
  const amountToApprove = CurrencyAmount.fromRawAmount(mockToken, '1000000000000000000')
  const account = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
  const spenderAddress = '0x9008d19f58aabd9ed0d60971565aa8510560ab41'
  const approveAmount = BigInt('123')
  const tradeApproveCallback = jest.fn()
  const shouldZeroApprove = jest.fn()
  const zeroApprove = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    mockUseTradeSpenderAddress.mockReturnValue(spenderAddress)
    mockUseWalletInfo.mockReturnValue({ account } as ReturnType<typeof useWalletInfo>)
    mockUseTradeApproveCallback.mockReturnValue(tradeApproveCallback)
    mockCallWidgetHook.mockResolvedValue(true)
    shouldZeroApprove.mockResolvedValue(false)
    mockUseShouldZeroApprove.mockReturnValue(shouldZeroApprove)
    mockUseZeroApprove.mockReturnValue(zeroApprove)
  })

  it('calls approval widget hook before on-chain approval', async () => {
    const { result } = renderHook(() => useApproveCurrency(amountToApprove, true))

    await result.current(approveAmount)

    await waitFor(() => {
      expect(mockCallWidgetHook).toHaveBeenCalledWith('ON_BEFORE_APPROVAL', {
        chainId: mockToken.chainId,
        sellToken: expect.objectContaining({
          address: mockToken.address,
          chainId: mockToken.chainId,
          decimals: mockToken.decimals,
          name: mockToken.name,
          symbol: mockToken.symbol,
        }),
        sellAmount: approveAmount.toString(),
        walletAddress: account,
        spenderAddress,
      })
      expect(tradeApproveCallback).toHaveBeenCalledWith(approveAmount, {
        useModals: true,
        waitForTxConfirmation: true,
      })
    })
  })

  it('does not run on-chain approval when widget hook blocks it', async () => {
    mockCallWidgetHook.mockResolvedValue(false)

    const { result } = renderHook(() => useApproveCurrency(amountToApprove, true))

    await result.current(approveAmount)

    await waitFor(() => {
      expect(mockCallWidgetHook).toHaveBeenCalled()
      expect(shouldZeroApprove).not.toHaveBeenCalled()
      expect(zeroApprove).not.toHaveBeenCalled()
      expect(tradeApproveCallback).not.toHaveBeenCalled()
    })
  })
})
