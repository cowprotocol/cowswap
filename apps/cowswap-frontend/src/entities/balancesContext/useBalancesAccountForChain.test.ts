import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useSolanaAccount, useWalletInfo, WalletInfo } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'

import { useBalancesAccountForChain } from './useBalancesAccountForChain'
import { useBalancesContext } from './useBalancesContext'

jest.mock('@cowprotocol/wallet', () => ({
  useSolanaAccount: jest.fn(),
  useWalletInfo: jest.fn(),
}))

jest.mock('./useBalancesContext', () => ({
  useBalancesContext: jest.fn(),
}))

const mockUseSolanaAccount = useSolanaAccount as jest.MockedFunction<typeof useSolanaAccount>
const mockUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const mockUseBalancesContext = useBalancesContext as jest.MockedFunction<typeof useBalancesContext>

describe('useBalancesAccountForChain', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockUseWalletInfo.mockReturnValue({ account: '0xEvmAccount' } as WalletInfo)
    mockUseBalancesContext.mockReturnValue({ account: undefined } as ReturnType<typeof useBalancesContext>)
    mockUseSolanaAccount.mockReturnValue('SoLanaPubKey11111111111111111111111111111')
  })

  it('returns the EVM wallet account for an EVM chain, regardless of the Solana account', () => {
    const { result } = renderHook(() => useBalancesAccountForChain(SupportedChainId.MAINNET))

    expect(result.current).toBe('0xEvmAccount')
  })

  it('prefers the proxy account over the EVM wallet account for an EVM chain', () => {
    mockUseBalancesContext.mockReturnValue({ account: '0xProxyAccount' } as ReturnType<typeof useBalancesContext>)

    const { result } = renderHook(() => useBalancesAccountForChain(SupportedChainId.MAINNET))

    expect(result.current).toBe('0xProxyAccount')
  })

  it('returns the Solana account (not the EVM account) for the Solana chain', () => {
    const { result } = renderHook(() => useBalancesAccountForChain(SupportedChainId.SOLANA))

    expect(result.current).toBe('SoLanaPubKey11111111111111111111111111111')
  })

  it('returns undefined for the Solana chain when no Solana account is connected', () => {
    mockUseSolanaAccount.mockReturnValue(undefined)

    const { result } = renderHook(() => useBalancesAccountForChain(SupportedChainId.SOLANA))

    expect(result.current).toBeUndefined()
  })
})
