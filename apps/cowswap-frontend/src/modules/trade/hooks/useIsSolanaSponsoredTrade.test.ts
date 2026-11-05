import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { PublicKey } from '@solana/web3.js'
import { renderHook } from '@testing-library/react'

import { useTradeQuote } from 'modules/tradeQuote'

import { TradeType } from 'common/modules/tradeNavigation'

import { useDerivedTradeState } from './useDerivedTradeState'
import { useIsSolanaSponsoredTrade } from './useIsSolanaSponsoredTrade'

jest.mock('@cowprotocol/common-hooks', () => ({ useFeatureFlags: jest.fn() }))
jest.mock('@cowprotocol/wallet', () => ({ useWalletInfo: jest.fn() }))
jest.mock('modules/tradeQuote', () => ({
  useTradeQuote: jest.fn(),
  isSolanaQuoteAndPost: (quote: unknown) => Boolean(quote),
}))
jest.mock('./useDerivedTradeState', () => ({ useDerivedTradeState: jest.fn() }))

const mockUseFeatureFlags = jest.mocked(useFeatureFlags)
const mockUseWalletInfo = jest.mocked(useWalletInfo)
const mockUseTradeQuote = jest.mocked(useTradeQuote)
const mockUseDerivedTradeState = jest.mocked(useDerivedTradeState)

const KEYPAIR_OWNER = new PublicKey(new Uint8Array(32).fill(6)).toBase58()
// A real Squads vault. jsdom's crypto shim breaks `findProgramAddressSync`, so the PDA is written out
// rather than derived; the test asserts it really is off the curve.
const VAULT_OWNER = 'D9DvzXZjyqECswED5YgHi4wA1qTVjjiGP76sN6Dr8vGE'
const FUNDER = new PublicKey(new Uint8Array(32).fill(8)).toBase58()

function setup({
  account = KEYPAIR_OWNER,
  chainId = SupportedChainId.SOLANA,
}: { account?: string; chainId?: SupportedChainId } = {}): void {
  mockUseFeatureFlags.mockReturnValue({ isSolanaSponsoredOrdersEnabled: true } as unknown as ReturnType<
    typeof useFeatureFlags
  >)
  mockUseWalletInfo.mockReturnValue({ account, chainId } as unknown as ReturnType<typeof useWalletInfo>)
  mockUseTradeQuote.mockReturnValue({ quote: { solanaQuote: { funder: FUNDER } } } as unknown as ReturnType<
    typeof useTradeQuote
  >)
  mockUseDerivedTradeState.mockReturnValue({ tradeType: TradeType.SWAP } as unknown as ReturnType<
    typeof useDerivedTradeState
  >)
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('useIsSolanaSponsoredTrade', () => {
  it('is sponsored for an ordinary keypair owner', () => {
    setup()

    expect(renderHook(() => useIsSolanaSponsoredTrade()).result.current).toBe(true)
  })

  // The displayed cost has to agree with the path `solanaFlow` takes, or the UI promises a sponsor
  // the flow will not use and the owner is billed for what the screen called free.
  it('is not sponsored for a smart contract wallet owner', () => {
    expect(PublicKey.isOnCurve(VAULT_OWNER)).toBe(false)

    setup({ account: VAULT_OWNER })

    expect(renderHook(() => useIsSolanaSponsoredTrade()).result.current).toBe(false)
  })

  it('leaves the estimate sponsored while no wallet is connected', () => {
    setup({ account: undefined as unknown as string })

    expect(renderHook(() => useIsSolanaSponsoredTrade()).result.current).toBe(true)
  })

  // A quote outlives the wallet that asked for it, so switching to an EVM wallet leaves an EVM
  // account beside a stale Solana quote. `PublicKey.isOnCurve` throws on a non-base58 string, which
  // would take the whole trade widget down during render.
  it('does not throw when an EVM account is current beside a stale solana quote', () => {
    setup({ account: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', chainId: SupportedChainId.MAINNET })

    expect(() => renderHook(() => useIsSolanaSponsoredTrade())).not.toThrow()
  })

  it('is not sponsored for a limit order', () => {
    setup()
    mockUseDerivedTradeState.mockReturnValue({ tradeType: TradeType.LIMIT_ORDER } as unknown as ReturnType<
      typeof useDerivedTradeState
    >)

    expect(renderHook(() => useIsSolanaSponsoredTrade()).result.current).toBe(false)
  })

  it('is not sponsored when the quote reports no funder', () => {
    setup()
    mockUseTradeQuote.mockReturnValue({ quote: { solanaQuote: {} } } as unknown as ReturnType<typeof useTradeQuote>)

    expect(renderHook(() => useIsSolanaSponsoredTrade()).result.current).toBe(false)
  })
})
