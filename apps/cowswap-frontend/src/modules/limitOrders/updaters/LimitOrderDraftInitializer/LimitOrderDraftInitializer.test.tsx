import { createStore, Provider } from 'jotai'
import { PropsWithChildren } from 'react'

import { USDC_MAINNET, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { FractionUtils } from '@cowprotocol/common-utils'
import { CurrencyAmount, Fraction } from '@cowprotocol/currency'

import { act, renderHook, RenderHookResult } from '@testing-library/react'

import { pendingLimitOrderDraftAtom } from 'modules/limitOrderDraft'
import { useUsdPrice } from 'modules/usdAmount'

import { LimitOrderDraftInitializer } from './LimitOrderDraftInitializer'

import { useLimitOrdersDerivedState } from '../../hooks/useLimitOrdersDerivedState'
import { useUpdateActiveRate } from '../../hooks/useUpdateActiveRate'
import { limitOrdersRawStateAtom } from '../../state/limitOrdersRawStateAtom'
import { limitRateAtom } from '../../state/limitRateAtom'
import { InitialPriceUpdater } from '../InitialPriceUpdater'
import { QuoteObserverUpdater } from '../QuoteObserverUpdater'

jest.mock('modules/trade', () => ({
  getPercentageRate: jest.requireActual('../../../trade/utils/percentageRate.utils').getPercentageRate,
  useDerivedTradeState: () => jest.requireMock('../../hooks/useLimitOrdersDerivedState').useLimitOrdersDerivedState(),
}))
jest.mock('../../state/limitOrdersRawStateAtom', () => {
  const { atom } = jest.requireActual('jotai')
  const state = atom({ recipient: 'old recipient' })
  return {
    limitOrdersRawStateAtom: state,
    updateLimitOrdersRawStateAtom: atom(
      null,
      (get: import('jotai').Getter, set: import('jotai').Setter, update: object) =>
        set(state, { ...get(state), ...update }),
    ),
  }
})
jest.mock('../../state/limitOrdersSettingsAtom', () => ({
  updateLimitOrdersSettingsAtom: jest.requireActual('jotai').atom(null, () => {}),
  limitOrdersSettingsAtom: jest.requireActual('jotai').atom({ limitPriceLocked: true }),
}))
jest.mock('modules/usdAmount', () => ({ useUsdPrice: jest.fn() }))
jest.mock('modules/tradeQuote', () => ({ useTradeQuote: () => ({ quote: undefined }) }))
jest.mock('../../hooks/useGetInitialPrice', () => {
  const price = new (jest.requireActual('@cowprotocol/currency').Fraction)(1)
  return { useGetInitialPrice: () => ({ price, isLoading: false }) }
})
jest.mock('../../hooks/useLimitOrdersRawState', () => ({
  useLimitOrdersRawState: () => ({ inputCurrencyId: 'WETH', outputCurrencyId: 'USDC', chainId: 1 }),
  useUpdateLimitOrdersRawState: () =>
    jest
      .requireActual('jotai')
      .useSetAtom(jest.requireMock('../../state/limitOrdersRawStateAtom').updateLimitOrdersRawStateAtom),
}))
jest.mock('../../hooks/useLimitOrdersDerivedState', () => ({ useLimitOrdersDerivedState: jest.fn() }))
jest.mock('@cowprotocol/wallet', () => ({ useWalletInfo: () => ({ account: undefined, chainId: 1 }) }))
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useLocation: () => ({ pathname: '/1/limit/WETH/USDC' }),
}))

const weth = WRAPPED_NATIVE_CURRENCIES[1]
const inputAmount = CurrencyAmount.fromRawAmount(weth, '1000000000000000000')
const request = {
  draft: { inputAmount, outputCurrency: USDC_MAINNET, price: { type: 'percentage' as const, value: '20' } },
  pathname: '/1/limit/WETH/USDC',
  account: undefined,
}

function setMarketPrice(value: number | null): void {
  const inputPrice = value === null ? null : FractionUtils.toPrice(new Fraction(value), weth, USDC_MAINNET)
  const outputPrice = FractionUtils.toPrice(new Fraction(1), USDC_MAINNET, USDC_MAINNET)
  jest
    .mocked(useUsdPrice)
    .mockImplementation((currency) =>
      currency
        ? { currency, price: currency.equals(weth) ? inputPrice : outputPrice, isLoading: value === null }
        : null,
    )
}

function setup(
  percentage: string | null = '20',
  withInitialPrice = false,
  matchesPair = true,
): RenderHookResult<ReturnType<typeof useUpdateActiveRate>, unknown> & { store: ReturnType<typeof createStore> } {
  const store = createStore()
  store.set(pendingLimitOrderDraftAtom, {
    ...request,
    draft: {
      ...request.draft,
      price: percentage === null ? { type: 'custom' } : { type: 'percentage', value: percentage },
    },
  })
  setMarketPrice(null)
  jest.mocked(useLimitOrdersDerivedState).mockReturnValue({
    inputCurrencyAmount: inputAmount,
    outputCurrencyAmount: null,
    orderKind: 'sell',
    inputCurrency: matchesPair ? weth : null,
    outputCurrency: USDC_MAINNET,
  } as ReturnType<typeof useLimitOrdersDerivedState>)
  const view = renderHook(
    () => {
      LimitOrderDraftInitializer()
      QuoteObserverUpdater()
      return useUpdateActiveRate()
    },
    {
      wrapper: ({ children }: PropsWithChildren) => (
        <Provider store={store}>
          {children}
          {withInitialPrice && <InitialPriceUpdater />}
        </Provider>
      ),
    },
  )
  return { store, ...view }
}

it('consumes the draft without waiting for a market price', () => {
  const { store } = setup()
  expect(store.get(pendingLimitOrderDraftAtom)).toBeNull()
  expect(store.get(limitRateAtom).percentageSelection).toEqual({ value: '20', isInverted: false })
  expect(store.get(limitRateAtom).activeRate).toBeNull()
  expect(
    FractionUtils.parseFractionFromJSON(store.get(limitOrdersRawStateAtom).inputCurrencyAmount)?.value.equalTo(
      '1000000000000000000',
    ),
  ).toBe(true)
  expect(store.get(limitOrdersRawStateAtom).outputCurrencyAmount).toBeNull()
})

it('opens custom empty and clears form-owned selection on departure', () => {
  const { store, unmount } = setup(null)
  expect(store.get(limitRateAtom).percentageSelection).toBeNull()
  expect(store.get(limitRateAtom).focusCustomPercentage).toBe(true)
  expect(store.get(limitRateAtom).activeRate).toBeNull()
  unmount()
  expect(store.get(limitRateAtom).isDraftInitialized).toBe(false)
  expect(store.get(limitRateAtom).focusCustomPercentage).toBe(false)
})

it('follows market updates until a manual price replaces the percentage', () => {
  const { store, rerender, result } = setup('20', true)
  setMarketPrice(2010)
  rerender()
  expect(store.get(limitRateAtom).activeRate?.equalTo(2412)).toBe(true)
  expect(
    FractionUtils.parseFractionFromJSON(store.get(limitOrdersRawStateAtom).outputCurrencyAmount)?.value.equalTo(
      '2412000000',
    ),
  ).toBe(true)
  setMarketPrice(3000)
  rerender()
  expect(store.get(limitRateAtom).activeRate?.equalTo(3600)).toBe(true)
  act(() =>
    result.current({
      activeRate: new Fraction(4000),
      isTypedValue: true,
      isRateFromUrl: false,
      isAlternativeOrderRate: false,
    }),
  )
  expect(store.get(limitRateAtom).percentageSelection).toBeNull()
  setMarketPrice(3500)
  rerender()
  expect(store.get(limitRateAtom).activeRate?.equalTo(4000)).toBe(true)
})

it('clears an unconsumed handoff on departure, without clearing a newer destination', () => {
  const waiting = setup('20', false, false)
  expect(waiting.store.get(pendingLimitOrderDraftAtom)).not.toBeNull()
  waiting.unmount()
  expect(waiting.store.get(pendingLimitOrderDraftAtom)).toBeNull()

  const current = setup()
  const next = { ...request, pathname: '/1/limit/USDC/WETH' }
  act(() => {
    current.store.set(pendingLimitOrderDraftAtom, next)
    current.unmount()
  })
  expect(current.store.get(pendingLimitOrderDraftAtom)).toBe(next)
})
