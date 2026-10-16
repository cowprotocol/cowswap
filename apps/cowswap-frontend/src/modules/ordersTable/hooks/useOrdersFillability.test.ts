import { useBalancesAndAllowances } from '@cowprotocol/balances-and-allowances'
import { NATIVE_CURRENCIES, USDC, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { getAddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { renderHook } from '@testing-library/react'

import { GenericOrder } from 'common/types'

import { useOrdersFillability } from './useOrdersFillability'

jest.mock('@cowprotocol/wallet', () => ({ useWalletInfo: jest.fn() }))
jest.mock('@cowprotocol/balances-and-allowances', () => ({ useBalancesAndAllowances: jest.fn() }))
jest.mock('common/utils/doesOrderHavePermit', () => ({ doesOrderHavePermit: jest.fn().mockReturnValue(false) }))

const mockUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const mockUseBalancesAndAllowances = useBalancesAndAllowances as jest.MockedFunction<typeof useBalancesAndAllowances>

const CHAIN_ID = SupportedChainId.MAINNET
const usdc = USDC[CHAIN_ID]
const wrappedNative = WRAPPED_NATIVE_CURRENCIES[CHAIN_ID]
const SELL_AMOUNT = '1000000'

function buildOrder(overrides: Partial<GenericOrder> = {}): GenericOrder {
  return { id: 'order-1', inputToken: usdc, sellAmount: SELL_AMOUNT, ...overrides } as GenericOrder
}

function mockFunding(balances: Record<string, bigint>, allowances: Record<string, bigint>): void {
  mockUseBalancesAndAllowances.mockReturnValue({ balances, allowances, isLoading: false })
}

describe('useOrdersFillability', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseWalletInfo.mockReturnValue({ chainId: CHAIN_ID } as ReturnType<typeof useWalletInfo>)
  })

  it('reports insufficient allowance for a self-paid order', () => {
    mockFunding({ [getAddressKey(usdc.address)]: BigInt(SELL_AMOUNT) }, {})

    const order = buildOrder()
    const { result } = renderHook(() => useOrdersFillability([order]))

    expect(result.current[order.id]?.hasEnoughAllowance).toBeUndefined()
  })

  // The SPL delegation is inside the bundle the order book only submits once a solver wins, so there is
  // nothing on chain to read while the order rests.
  it('treats the allowance as satisfied for a sponsored order', () => {
    mockFunding({ [getAddressKey(usdc.address)]: BigInt(SELL_AMOUNT) }, {})

    const order = buildOrder({ isSponsored: true })
    const { result } = renderHook(() => useOrdersFillability([order]))

    expect(result.current[order.id]?.hasEnoughAllowance).toBe(true)
    expect(result.current[order.id]?.hasEnoughBalance).toBe(true)
  })

  it('still reports insufficient balance for a sponsored order', () => {
    mockFunding({ [getAddressKey(usdc.address)]: 0n }, {})

    const order = buildOrder({ isSponsored: true })
    const { result } = renderHook(() => useOrdersFillability([order]))

    expect(result.current[order.id]?.hasEnoughBalance).toBe(false)
  })

  // The wrap producing the sold token is deferred with the rest of the bundle, so the native balance is
  // what actually backs a sponsored native sell.
  it('reads the native balance for a sponsored native sell', () => {
    mockFunding({ [getAddressKey(NATIVE_CURRENCIES[CHAIN_ID].address)]: BigInt(SELL_AMOUNT) }, {})

    const order = buildOrder({ inputToken: wrappedNative, isSponsored: true, isNativeSell: true })
    const { result } = renderHook(() => useOrdersFillability([order]))

    expect(result.current[order.id]?.hasEnoughBalance).toBe(true)
  })

  it('reads the sold token balance for a self-paid native sell', () => {
    mockFunding({ [getAddressKey(NATIVE_CURRENCIES[CHAIN_ID].address)]: BigInt(SELL_AMOUNT) }, {})

    const order = buildOrder({ inputToken: wrappedNative, isNativeSell: true })
    const { result } = renderHook(() => useOrdersFillability([order]))

    expect(result.current[order.id]?.hasEnoughBalance).toBeUndefined()
  })
})
