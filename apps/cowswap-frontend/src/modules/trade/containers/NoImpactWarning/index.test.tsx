import { createStore, Provider } from 'jotai'

import { Percent } from '@cowprotocol/currency'
import { useWalletInfo } from '@cowprotocol/wallet'

import { render, screen } from '@testing-library/react'

import { useGetTradeFormValidation } from 'modules/tradeFormValidation'
import { useTradeQuote } from 'modules/tradeQuote'

import { noImpactWarningAcceptedAtom } from './useIsNoImpactWarningAccepted'

import { useTradePriceImpact } from '../../hooks/useTradePriceImpact'

import { NoImpactWarning } from './index'

jest.mock('@cowprotocol/wallet', () => ({
  useWalletInfo: jest.fn(),
}))

jest.mock('modules/tradeFormValidation', () => ({
  ACTIVE_VALIDATION_CASES: [],
  useGetTradeFormValidation: jest.fn(),
}))

jest.mock('modules/tradeQuote', () => ({
  useTradeQuote: jest.fn(),
}))

jest.mock('modules/trade/pure/TradeWarning', () => ({
  TradeWarning: () => <div data-testid="no-impact-warning" />,
}))

jest.mock('../../hooks/useTradePriceImpact', () => ({
  useTradePriceImpact: jest.fn(),
}))

const mockedUseWalletInfo = useWalletInfo as jest.MockedFunction<typeof useWalletInfo>
const mockedUseGetTradeFormValidation = useGetTradeFormValidation as jest.MockedFunction<
  typeof useGetTradeFormValidation
>
const mockedUseTradeQuote = useTradeQuote as jest.MockedFunction<typeof useTradeQuote>
const mockedUseTradePriceImpact = useTradePriceImpact as jest.MockedFunction<typeof useTradePriceImpact>

function renderWarning(): ReturnType<typeof createStore> {
  const store = createStore()

  render(
    <Provider store={store}>
      <NoImpactWarning />
    </Provider>,
  )

  return store
}

describe('NoImpactWarning', () => {
  beforeEach(() => {
    mockedUseWalletInfo.mockReturnValue({ account: '0x0000000000000000000000000000000000000001' } as ReturnType<
      typeof useWalletInfo
    >)
    mockedUseGetTradeFormValidation.mockReturnValue(null)
    mockedUseTradeQuote.mockReturnValue({ error: null } as ReturnType<typeof useTradeQuote>)
  })

  it('stays hidden but blocks the trade while price impact is loading', () => {
    mockedUseTradePriceImpact.mockReturnValue({ priceImpact: undefined, loading: true })

    const store = renderWarning()

    expect(screen.queryByTestId('no-impact-warning')).toBeNull()
    expect(store.get(noImpactWarningAcceptedAtom)).toBe(false)
  })

  it('shows and blocks the trade when price impact is unknown', () => {
    mockedUseTradePriceImpact.mockReturnValue({ priceImpact: undefined, loading: false })

    const store = renderWarning()

    expect(screen.getByTestId('no-impact-warning')).toBeTruthy()
    expect(store.get(noImpactWarningAcceptedAtom)).toBe(false)
  })

  it('stays hidden and allows the trade when price impact is known', () => {
    mockedUseTradePriceImpact.mockReturnValue({ priceImpact: new Percent(1, 100), loading: false })

    const store = renderWarning()

    expect(screen.queryByTestId('no-impact-warning')).toBeNull()
    expect(store.get(noImpactWarningAcceptedAtom)).toBe(true)
  })
})
