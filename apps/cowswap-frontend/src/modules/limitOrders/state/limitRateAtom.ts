import { atom } from 'jotai'

import { atomWithPartialUpdate } from '@cowprotocol/common-utils'
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
  // Respect alternative order initial rate
  readonly isAlternativeOrderRate: boolean
  readonly isInitialPriceSet?: boolean
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
  isAlternativeOrderRate: false,
})

export const { atom: limitRateAtom, updateAtom: updateLimitRateAtom } = atomWithPartialUpdate(
  atom<LimitRateState>(initLimitRateState())
)
