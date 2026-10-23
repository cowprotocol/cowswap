import { atom } from 'jotai'

import { atomWithPartialUpdate } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount, Fraction } from '@cowprotocol/currency'

export interface LimitRateState {
  readonly percentageSelection: { value: string; isInverted: boolean } | null
  readonly focusCustomPercentage: boolean
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
  // Respect alternative order initial rate
  readonly isAlternativeOrderRate: boolean
  readonly isInitialPriceSet?: boolean
}

export const defaultLimitPriceState = {
  percentageSelection: null,
  focusCustomPercentage: false,
  isInverted: false,
  activeRate: null,
  isTypedValue: false,
  isRateFromUrl: false,
  typedValue: null,
  isAlternativeOrderRate: false,
} satisfies Partial<LimitRateState>

export const initLimitRateState = (): LimitRateState => ({
  ...defaultLimitPriceState,
  isLoading: false,
  isLoadingMarketRate: false,
  initialRate: null,
  marketRate: null,
  feeAmount: null,
})

export const { atom: limitRateAtom, updateAtom: updateLimitRateAtom } = atomWithPartialUpdate(
  atom<LimitRateState>(initLimitRateState()),
)
