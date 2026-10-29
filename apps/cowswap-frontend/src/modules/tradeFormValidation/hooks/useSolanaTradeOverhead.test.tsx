import { ReactElement, ReactNode } from 'react'

import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, Token } from '@cowprotocol/currency'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { renderHook, waitFor } from '@testing-library/react'
import { SWRConfig } from 'swr'

import {
  getSolanaTradeOverhead,
  getWrapFundedAccounts,
  planSolanaTradeFundedAccounts,
  useDerivedTradeState,
  useIsSolanaSponsoredTrade,
  useIsWrapOrUnwrap,
} from 'modules/trade'
import { useTradeQuote } from 'modules/tradeQuote'

import { useSolanaTradeOverhead } from './useSolanaTradeOverhead'

jest.mock('@cowprotocol/wallet', () => ({ useWalletInfo: jest.fn() }))
jest.mock('@cowprotocol/common-hooks', () => ({ useFeatureFlags: jest.fn() }))
jest.mock('@reown/appkit-adapter-solana/react', () => ({ useAppKitConnection: jest.fn() }))
jest.mock('modules/trade', () => ({
  getSolanaTradeOverhead: jest.fn(),
  getWrapFundedAccounts: jest.fn(),
  planSolanaTradeFundedAccounts: jest.fn(),
  useDerivedTradeState: jest.fn(),
  useIsSolanaSponsoredTrade: jest.fn(),
  useIsWrapOrUnwrap: jest.fn(),
}))
jest.mock('modules/tradeQuote', () => ({
  useTradeQuote: jest.fn(),
  isSolanaQuoteAndPost: () => true,
}))

const mockUseWalletInfo = jest.mocked(useWalletInfo)
const mockUseFeatureFlags = jest.mocked(useFeatureFlags)
const mockUseAppKitConnection = jest.mocked(useAppKitConnection)
const mockGetSolanaTradeOverhead = jest.mocked(getSolanaTradeOverhead)
const mockGetWrapFundedAccounts = jest.mocked(getWrapFundedAccounts)
const mockPlanSolanaTradeFundedAccounts = jest.mocked(planSolanaTradeFundedAccounts)
const mockUseDerivedTradeState = jest.mocked(useDerivedTradeState)
const mockUseIsSolanaSponsoredTrade = jest.mocked(useIsSolanaSponsoredTrade)
const mockUseIsWrapOrUnwrap = jest.mocked(useIsWrapOrUnwrap)
const mockUseTradeQuote = jest.mocked(useTradeQuote)

const OWNER = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'
const NATIVE_SOL = NATIVE_CURRENCIES[SupportedChainId.SOLANA] as unknown as Currency
const SOLANA_USDC = new Token(SupportedChainId.SOLANA, 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', 6, 'USDC')

// Sentinels: the hook only forwards these lists, so identity is all the assertions need.
const WRAP_ACCOUNTS = [{ size: 165 }] as unknown as ReturnType<typeof getWrapFundedAccounts>
const FULL_ACCOUNTS = [{ size: 1 }, { size: 2 }] as unknown as ReturnType<typeof planSolanaTradeFundedAccounts>

const connection = { rpcEndpoint: 'https://solana.example' }

// Every case builds the same cache keys, so a shared SWR store would serve the previous test's
// result and never call the fetcher again.
const wrapper = ({ children }: { children: ReactNode }): ReactElement => (
  <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>
)

function setup({ inputCurrency, isSponsored }: { inputCurrency: Currency; isSponsored: boolean }): void {
  mockUseDerivedTradeState.mockReturnValue({ inputCurrency } as unknown as ReturnType<typeof useDerivedTradeState>)
  mockUseIsSolanaSponsoredTrade.mockReturnValue(isSponsored)
}

beforeEach(() => {
  jest.clearAllMocks()
  mockUseWalletInfo.mockReturnValue({ chainId: SupportedChainId.SOLANA, account: OWNER } as unknown as ReturnType<
    typeof useWalletInfo
  >)
  mockUseFeatureFlags.mockReturnValue({} as unknown as ReturnType<typeof useFeatureFlags>)
  mockUseAppKitConnection.mockReturnValue({ connection } as unknown as ReturnType<typeof useAppKitConnection>)
  mockUseIsWrapOrUnwrap.mockReturnValue(false)
  mockUseTradeQuote.mockReturnValue({ quote: { solanaQuote: {} } } as unknown as ReturnType<typeof useTradeQuote>)
  mockGetWrapFundedAccounts.mockReturnValue(WRAP_ACCOUNTS)
  mockPlanSolanaTradeFundedAccounts.mockReturnValue(FULL_ACCOUNTS)
  mockGetSolanaTradeOverhead.mockResolvedValue({ required: 0n, maxReserve: 0n, spent: 0n })
})

describe('useSolanaTradeOverhead', () => {
  // The WSOL account is the owner's to close, so its rent is theirs to fund even when the funder pays
  // for everything else — the gate has to hold it back or a MAX sell leaves nothing for it.
  it('prices the WSOL account against the owner on a sponsored native sell', async () => {
    setup({ inputCurrency: NATIVE_SOL, isSponsored: true })

    renderHook(() => useSolanaTradeOverhead(), { wrapper })

    await waitFor(() => expect(mockGetSolanaTradeOverhead).toHaveBeenCalled())
    expect(mockGetSolanaTradeOverhead).toHaveBeenCalledWith(connection, WRAP_ACCOUNTS, { ownerPaysFees: false })
    expect(mockGetWrapFundedAccounts).toHaveBeenCalled()
  })

  it('leaves a sponsored token sell entirely to the funder', async () => {
    setup({ inputCurrency: SOLANA_USDC, isSponsored: true })

    const { result } = renderHook(() => useSolanaTradeOverhead(), { wrapper })

    await waitFor(() => expect(result.current).toBeNull())
    expect(mockGetSolanaTradeOverhead).not.toHaveBeenCalled()
  })

  it('prices the whole bundle against the owner when nothing is sponsored', async () => {
    setup({ inputCurrency: NATIVE_SOL, isSponsored: false })

    renderHook(() => useSolanaTradeOverhead(), { wrapper })

    await waitFor(() => expect(mockGetSolanaTradeOverhead).toHaveBeenCalled())
    expect(mockGetSolanaTradeOverhead).toHaveBeenCalledWith(connection, FULL_ACCOUNTS, { ownerPaysFees: true })
  })

  it('ignores the sponsor when asked for the full placement cost', async () => {
    setup({ inputCurrency: NATIVE_SOL, isSponsored: true })

    renderHook(() => useSolanaTradeOverhead({ ignoreSponsor: true }), { wrapper })

    await waitFor(() => expect(mockGetSolanaTradeOverhead).toHaveBeenCalled())
    expect(mockGetSolanaTradeOverhead).toHaveBeenCalledWith(connection, FULL_ACCOUNTS, { ownerPaysFees: true })
  })
})
