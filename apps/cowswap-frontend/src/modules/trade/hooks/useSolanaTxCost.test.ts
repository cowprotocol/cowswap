import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'

import { useSolanaTradeOverhead } from 'modules/tradeFormValidation'

import { useIsSolanaSponsoredTrade } from './useIsSolanaSponsoredTrade'
import { useSolanaTxCost } from './useSolanaTxCost'

jest.mock('@cowprotocol/wallet', () => ({ useWalletInfo: jest.fn() }))
jest.mock('modules/tradeFormValidation', () => ({ useSolanaTradeOverhead: jest.fn() }))
jest.mock('./useIsSolanaSponsoredTrade', () => ({ useIsSolanaSponsoredTrade: jest.fn() }))

const mockUseWalletInfo = jest.mocked(useWalletInfo)
const mockUseSolanaTradeOverhead = jest.mocked(useSolanaTradeOverhead)
const mockUseIsSolanaSponsoredTrade = jest.mocked(useIsSolanaSponsoredTrade)

const PLACEMENT_COST = 3_000_000n
const WSOL_RENT = 1_488_440n

/** The hook asks twice: once ignoring the sponsor (the whole cost), once for the owner's own share. */
function mockOverheads({ full, owner }: { full: bigint; owner: bigint | null }): void {
  mockUseSolanaTradeOverhead.mockImplementation((options) => {
    if (options?.ignoreSponsor) return overhead(full)

    return owner === null ? null : overhead(owner)
  })
}

function overhead(spent: bigint): ReturnType<typeof useSolanaTradeOverhead> {
  return { required: spent, maxReserve: spent, spent }
}

beforeEach(() => {
  jest.clearAllMocks()
  mockUseWalletInfo.mockReturnValue({ chainId: SupportedChainId.SOLANA } as unknown as ReturnType<typeof useWalletInfo>)
})

describe('useSolanaTxCost', () => {
  it('reports the whole placement cost as the owner-paid amount when nothing is sponsored', () => {
    mockUseIsSolanaSponsoredTrade.mockReturnValue(false)
    mockOverheads({ full: PLACEMENT_COST, owner: PLACEMENT_COST })

    const { result } = renderHook(() => useSolanaTxCost())

    expect(result.current?.amount.quotient.toString()).toBe(PLACEMENT_COST.toString())
    expect(result.current?.isSponsored).toBe(false)
    expect(result.current?.ownerDeposit).toBeNull()
  })

  it('names the WSOL rent as the owner deposit on a sponsored native sell', () => {
    mockUseIsSolanaSponsoredTrade.mockReturnValue(true)
    mockOverheads({ full: PLACEMENT_COST, owner: WSOL_RENT })

    const { result } = renderHook(() => useSolanaTxCost())

    expect(result.current?.amount.quotient.toString()).toBe(PLACEMENT_COST.toString())
    expect(result.current?.isSponsored).toBe(true)
    expect(result.current?.ownerDeposit?.quotient.toString()).toBe(WSOL_RENT.toString())
  })

  it('leaves no owner deposit on a sponsored sell that opens no WSOL account', () => {
    mockUseIsSolanaSponsoredTrade.mockReturnValue(true)
    mockOverheads({ full: PLACEMENT_COST, owner: null })

    const { result } = renderHook(() => useSolanaTxCost())

    expect(result.current?.isSponsored).toBe(true)
    expect(result.current?.ownerDeposit).toBeNull()
  })

  it('returns null while the placement cost is unknown', () => {
    mockUseIsSolanaSponsoredTrade.mockReturnValue(false)
    mockUseSolanaTradeOverhead.mockReturnValue(null)

    const { result } = renderHook(() => useSolanaTxCost())

    expect(result.current).toBeNull()
  })
})
