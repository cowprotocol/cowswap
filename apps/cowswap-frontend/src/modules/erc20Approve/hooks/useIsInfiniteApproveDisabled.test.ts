import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo, WalletInfo } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'

import { useIsInfiniteApproveDisabledInWidget } from 'modules/injectedWidget'

import { useIsInfiniteApproveDisabled } from './useIsInfiniteApproveDisabled'

jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: jest.fn(),
}))

jest.mock('modules/injectedWidget', () => ({
  useIsInfiniteApproveDisabledInWidget: jest.fn(),
}))

const mockUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const mockUseIsInfiniteApproveDisabledInWidget = useIsInfiniteApproveDisabledInWidget as jest.MockedFunction<
  typeof useIsInfiniteApproveDisabledInWidget
>

function setup(chainId: SupportedChainId, isDisabledInWidget: boolean): boolean {
  mockUseWalletInfo.mockReturnValue({ chainId } as WalletInfo)
  mockUseIsInfiniteApproveDisabledInWidget.mockReturnValue(isDisabledInWidget)

  return renderHook(() => useIsInfiniteApproveDisabled()).result.current
}

describe('useIsInfiniteApproveDisabled', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('disables infinite approve on Solana', () => {
    expect(setup(SupportedChainId.SOLANA, false)).toBe(true)
  })

  it('leaves infinite approve available on EVM chains', () => {
    expect(setup(SupportedChainId.MAINNET, false)).toBe(false)
  })

  it('still honours the widget flag on EVM chains', () => {
    expect(setup(SupportedChainId.MAINNET, true)).toBe(true)
  })
})
