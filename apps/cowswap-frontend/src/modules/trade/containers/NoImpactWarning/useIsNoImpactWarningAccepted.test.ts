import { Provider, useSetAtom } from 'jotai'
import { createElement, type ReactNode } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { act, renderHook } from '@testing-library/react'

import { TradeFormValidation, useGetTradeFormValidation } from 'modules/tradeFormValidation'
import { useTradeQuote } from 'modules/tradeQuote'

import { noImpactWarningAcceptedAtom, useIsNoImpactWarningAccepted } from './useIsNoImpactWarningAccepted'

import { useTradePriceImpact } from '../../hooks/useTradePriceImpact'

jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: jest.fn(),
}))

jest.mock('modules/tradeFormValidation', () => ({
  TradeFormValidation: {
    SellNativeToken: 32,
  },
  ACTIVE_VALIDATION_CASES: [32],
  useGetTradeFormValidation: jest.fn(),
}))

jest.mock('modules/tradeQuote', () => ({
  useTradeQuote: jest.fn(),
}))

jest.mock('../../hooks/useTradePriceImpact', () => ({
  useTradePriceImpact: jest.fn(),
}))

const mockUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const mockUseGetTradeFormValidation = useGetTradeFormValidation as jest.MockedFunction<typeof useGetTradeFormValidation>
const mockUseTradeQuote = useTradeQuote as jest.MockedFunction<typeof useTradeQuote>
const mockUseTradePriceImpact = useTradePriceImpact as jest.MockedFunction<typeof useTradePriceImpact>

function TestProvider({ children }: { children: ReactNode }): ReactNode {
  return createElement(Provider, null, children)
}

function renderAccepted(): ReturnType<typeof renderHook<{ accepted: boolean; setAccepted: (value: boolean) => void }>> {
  return renderHook(
    () => {
      const setAccepted = useSetAtom(noImpactWarningAcceptedAtom)

      return {
        accepted: useIsNoImpactWarningAccepted(),
        setAccepted,
      }
    },
    { wrapper: TestProvider },
  )
}

describe('useIsNoImpactWarningAccepted', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    mockUseWalletInfo.mockReturnValue({ account: '0x0000000000000000000000000000000000000001' } as ReturnType<
      typeof useWalletInfo
    >)
    mockUseGetTradeFormValidation.mockReturnValue(null)
    mockUseTradeQuote.mockReturnValue({ error: undefined } as ReturnType<typeof useTradeQuote>)
    mockUseTradePriceImpact.mockReturnValue({ loading: false, priceImpact: {} } as ReturnType<
      typeof useTradePriceImpact
    >)
  })

  it('is accepted when the no-impact warning is not shown', () => {
    expect(renderAccepted().result.current.accepted).toBe(true)
  })

  it('uses the explicit acceptance state when the no-impact warning is shown', () => {
    mockUseTradePriceImpact.mockReturnValue({ loading: false, priceImpact: undefined } as ReturnType<
      typeof useTradePriceImpact
    >)

    const { result } = renderAccepted()

    expect(result.current.accepted).toBe(false)

    act(() => result.current.setAccepted(true))

    expect(result.current.accepted).toBe(true)
  })

  it('becomes accepted when the no-impact warning stops being shown', () => {
    mockUseTradePriceImpact.mockReturnValue({ loading: true, priceImpact: undefined } as ReturnType<
      typeof useTradePriceImpact
    >)

    const { result, rerender } = renderAccepted()

    expect(result.current.accepted).toBe(false)

    mockUseTradePriceImpact.mockReturnValue({ loading: false, priceImpact: {} } as ReturnType<
      typeof useTradePriceImpact
    >)

    rerender()

    expect(result.current.accepted).toBe(true)
  })

  it('can show the warning for active native-sell validations', () => {
    mockUseGetTradeFormValidation.mockReturnValue(TradeFormValidation.SellNativeToken)
    mockUseTradePriceImpact.mockReturnValue({ loading: true, priceImpact: undefined } as ReturnType<
      typeof useTradePriceImpact
    >)

    expect(renderAccepted().result.current.accepted).toBe(false)
  })
})
