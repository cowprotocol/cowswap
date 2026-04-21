import { useIsSmartContractWallet, useWalletInfo } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'

import { useTradeStateFromUrl } from './setupTradeState/useTradeStateFromUrl'
import { useIsCurrentTradeBridging } from './useIsCurrentTradeBridging'
import { useIsNonEvmBridging } from './useIsNonEvmBridging'
import { useIsWrapOrUnwrap } from './useIsWrapOrUnwrap'
import { useWithRecipient } from './useWithRecipient'

jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: jest.fn(() => ({ account: undefined, chainId: 1 })),
  useIsSmartContractWallet: jest.fn(() => false),
}))

jest.mock('./useIsWrapOrUnwrap', () => ({
  useIsWrapOrUnwrap: jest.fn(() => false),
}))

jest.mock('./useIsNonEvmBridging', () => ({
  useIsNonEvmBridging: jest.fn(() => false),
}))

jest.mock('./useIsCurrentTradeBridging', () => ({
  useIsCurrentTradeBridging: jest.fn(() => false),
}))

jest.mock('./setupTradeState/useTradeStateFromUrl', () => ({
  useTradeStateFromUrl: jest.fn(() => null),
}))

const mockUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const mockUseIsSmartContractWallet = useIsSmartContractWallet as jest.MockedFunction<typeof useIsSmartContractWallet>
const mockUseIsWrapOrUnwrap = useIsWrapOrUnwrap as jest.MockedFunction<typeof useIsWrapOrUnwrap>
const mockUseIsNonEvmBridging = useIsNonEvmBridging as jest.MockedFunction<typeof useIsNonEvmBridging>
const mockUseIsCurrentTradeBridging = useIsCurrentTradeBridging as jest.MockedFunction<typeof useIsCurrentTradeBridging>
const mockUseTradeStateFromUrl = useTradeStateFromUrl as jest.MockedFunction<typeof useTradeStateFromUrl>

const ACCOUNT = '0xabc'

function renderUseWithRecipient(showRecipient: boolean): boolean {
  const { result } = renderHook(() => useWithRecipient(showRecipient))
  return result.current
}

describe('useWithRecipient', () => {
  beforeEach(() => {
    mockUseWalletInfo.mockReturnValue({ account: undefined, chainId: 1 } as ReturnType<typeof useWalletInfo>)
    mockUseIsSmartContractWallet.mockReturnValue(false)
    mockUseIsWrapOrUnwrap.mockReturnValue(false)
    mockUseIsNonEvmBridging.mockReturnValue(false)
    mockUseIsCurrentTradeBridging.mockReturnValue(false)
    mockUseTradeStateFromUrl.mockReturnValue(null)
  })

  describe('always false during wrap/unwrap', () => {
    it('returns false for non-EVM bridging during wrap/unwrap', () => {
      mockUseIsWrapOrUnwrap.mockReturnValue(true)
      mockUseIsNonEvmBridging.mockReturnValue(true)
      mockUseWalletInfo.mockReturnValue({ account: ACCOUNT, chainId: 1 } as ReturnType<typeof useWalletInfo>)
      expect(renderUseWithRecipient(false)).toBe(false)
    })

    it('returns false when recipient is in URL during wrap/unwrap', () => {
      mockUseIsWrapOrUnwrap.mockReturnValue(true)
      mockUseTradeStateFromUrl.mockReturnValue({ recipient: '0xabc' } as ReturnType<typeof useTradeStateFromUrl>)
      expect(renderUseWithRecipient(false)).toBe(false)
    })
  })

  describe('non-EVM bridging', () => {
    it('returns true when account is connected', () => {
      mockUseIsNonEvmBridging.mockReturnValue(true)
      mockUseWalletInfo.mockReturnValue({ account: ACCOUNT, chainId: 1 } as ReturnType<typeof useWalletInfo>)
      expect(renderUseWithRecipient(false)).toBe(true)
    })

    it('returns false when account is not connected', () => {
      mockUseIsNonEvmBridging.mockReturnValue(true)
      expect(renderUseWithRecipient(false)).toBe(false)
    })
  })

  describe('SC wallet + EVM bridge', () => {
    it('returns true when account is connected', () => {
      mockUseIsCurrentTradeBridging.mockReturnValue(true)
      mockUseIsSmartContractWallet.mockReturnValue(true)
      mockUseWalletInfo.mockReturnValue({ account: ACCOUNT, chainId: 1 } as ReturnType<typeof useWalletInfo>)
      expect(renderUseWithRecipient(false)).toBe(true)
    })

    it('returns false when account is not connected', () => {
      mockUseIsCurrentTradeBridging.mockReturnValue(true)
      mockUseIsSmartContractWallet.mockReturnValue(true)
      expect(renderUseWithRecipient(false)).toBe(false)
    })
  })

  describe('recipient in URL', () => {
    it('returns true even without account', () => {
      mockUseTradeStateFromUrl.mockReturnValue({ recipient: '0xabc' } as ReturnType<typeof useTradeStateFromUrl>)
      expect(renderUseWithRecipient(false)).toBe(true)
    })
  })

  describe('manual showRecipient toggle', () => {
    it('returns true when showRecipient=true regardless of wallet connection', () => {
      expect(renderUseWithRecipient(true)).toBe(true)
    })

    it('returns false when showRecipient=false (EVM, no bridging)', () => {
      expect(renderUseWithRecipient(false)).toBe(false)
    })
  })
})
