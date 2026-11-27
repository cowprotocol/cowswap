import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'
import { useInjectedWidgetParams } from 'entities/injectedWidget'

import { useIsCustomRecipientDisabled } from './useIsCustomRecipientDisabled'

jest.mock('entities/injectedWidget', () => ({
  useInjectedWidgetParams: jest.fn(),
}))

jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: jest.fn(),
}))

const mockUseInjectedWidgetParams = useInjectedWidgetParams as jest.MockedFunction<typeof useInjectedWidgetParams>
const mockUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>

function setup({ disableCustomRecipient = false, chainId = SupportedChainId.MAINNET } = {}): void {
  mockUseInjectedWidgetParams.mockReturnValue({ disableCustomRecipient } as ReturnType<typeof useInjectedWidgetParams>)
  mockUseWalletInfo.mockReturnValue({ chainId } as ReturnType<typeof useWalletInfo>)
}

describe('useIsCustomRecipientDisabled', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setup()
  })

  it('disables the recipient when the injected widget asks for it', () => {
    setup({ disableCustomRecipient: true })

    expect(renderHook(() => useIsCustomRecipientDisabled()).result.current).toBe(true)
  })

  it('leaves the recipient available otherwise', () => {
    expect(renderHook(() => useIsCustomRecipientDisabled()).result.current).toBe(false)
  })

  // The chain used to disable it too, and that doubled as a blanket reset: `useResetRecipient` clears
  // the recipient and strips it from the URL whenever this returns true. Re-adding a chain here would
  // silently restore that reset, so the wallet chain is pinned as irrelevant on purpose.
  it.each([
    ['Solana', SupportedChainId.SOLANA],
    ['Ethereum', SupportedChainId.MAINNET],
  ])('leaves the recipient available on %s', (_label, chainId) => {
    setup({ chainId })

    expect(renderHook(() => useIsCustomRecipientDisabled()).result.current).toBe(false)
  })

  it('keeps the widget flag winning over the wallet chain', () => {
    setup({ disableCustomRecipient: true, chainId: SupportedChainId.SOLANA })

    expect(renderHook(() => useIsCustomRecipientDisabled()).result.current).toBe(true)
  })
})
