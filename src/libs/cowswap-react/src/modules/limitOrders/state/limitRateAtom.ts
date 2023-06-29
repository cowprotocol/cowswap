import { atom } from 'jotai'

import { Currency, CurrencyAmount, Fraction } from '@uniswap/sdk-core'

export interface LimitRateState {
  readonly isLoading: boolean
  readonly isLoadingMarketRate: boolean
  readonly isInverted: boolean
  readonly initialRate: Fraction | null
  readonly activeRate: Fraction | null
  readonly marketRate: Fraction | null
  readonly feeAmount: CurrencyAmount<Currency> | null
  readonly isTypedValue: boolean
  // To avoid price overriding when it's already set from useSetupLimitOrderAmountsFromUrl()
  readonly isRateFromUrl: boolean
  readonly typedValue: string | null
}

export const initLimitRateState = () => ({
  isInverted: false,
  isLoading: false,
  isLoadingMarketRate: false,
  initialRate: null,
  activeRate: null,
  marketRate: null,
  feeAmount: null,
  isTypedValue: false,
  isRateFromUrl: false,
  typedValue: null,
})

export const limitRateAtom = atom<LimitRateState>(initLimitRateState())

export const updateLimitRateAtom = atom(null, (get, set, nextState: Partial<LimitRateState>) => {
  set(limitRateAtom, () => {
    const prevState = get(limitRateAtom)

    return { ...prevState, ...nextState }
  })
})
