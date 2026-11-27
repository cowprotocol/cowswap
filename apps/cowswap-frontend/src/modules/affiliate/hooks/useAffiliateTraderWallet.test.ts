import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletChainId } from '@cowprotocol/wallet-provider'

import { renderHook } from '@testing-library/react'

import { useAffiliateTraderEligibility } from './useAffiliateTraderEligibility'
import { TraderWalletStatus, useAffiliateTraderWallet } from './useAffiliateTraderWallet'

jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: jest.fn(),
}))

jest.mock('@cowprotocol/wallet-provider', () => ({
  useWalletChainId: jest.fn(),
}))

jest.mock('../state/affiliateTraderSavedCodeAtom', () => {
  const { atom } = jest.requireActual('jotai')

  return { affiliateTraderSavedCodeAtom: atom({ isLinked: false }) }
})

jest.mock('./useAffiliateTraderEligibility', () => ({
  TraderEligibilityStatus: {
    IDLE: 'idle',
    LOADING: 'loading',
    ERROR: 'error',
    HAS_PAST_TRADES: 'has-past-trades',
    NO_PAST_TRADES: 'no-past-trades',
  },
  useAffiliateTraderEligibility: jest.fn(() => ({ status: 'no-past-trades', hasLoadingTimeout: false })),
}))

const useWalletInfoMock = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const useWalletChainIdMock = useWalletChainId as jest.MockedFunction<typeof useWalletChainId>
const useAffiliateTraderEligibilityMock = useAffiliateTraderEligibility as jest.MockedFunction<
  typeof useAffiliateTraderEligibility
>

const EVM_ACCOUNT = '0x0000000000000000000000000000000000000001'
const SOLANA_ACCOUNT = '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV'

function mockWallet(chainId: SupportedChainId, account: string | undefined, walletChainId?: number): void {
  useWalletInfoMock.mockReturnValue({ chainId, account, active: !!account } as ReturnType<typeof useWalletInfo>)
  useWalletChainIdMock.mockReturnValue(walletChainId)
}

describe('useAffiliateTraderWallet', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns UNSUPPORTED for a connected Solana wallet even when wagmi keeps an EVM chain', () => {
    mockWallet(SupportedChainId.SOLANA, SOLANA_ACCOUNT, SupportedChainId.MAINNET)

    const { result } = renderHook(() => useAffiliateTraderWallet())

    expect(result.current).toBe(TraderWalletStatus.UNSUPPORTED)
    expect(useAffiliateTraderEligibilityMock).toHaveBeenCalledWith({ account: SOLANA_ACCOUNT, enabled: false })
  })

  it('returns DISCONNECTED on Solana without an account', () => {
    mockWallet(SupportedChainId.SOLANA, undefined, undefined)

    const { result } = renderHook(() => useAffiliateTraderWallet())

    expect(result.current).toBe(TraderWalletStatus.DISCONNECTED)
  })

  it('uses the wagmi chain on EVM networks', () => {
    mockWallet(SupportedChainId.MAINNET, EVM_ACCOUNT, SupportedChainId.MAINNET)

    const { result } = renderHook(() => useAffiliateTraderWallet())

    expect(result.current).toBe(TraderWalletStatus.ELIGIBLE)
    expect(useAffiliateTraderEligibilityMock).toHaveBeenCalledWith({ account: EVM_ACCOUNT, enabled: true })
  })
})
