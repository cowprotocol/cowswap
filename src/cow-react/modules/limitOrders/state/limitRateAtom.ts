import { Fraction } from '@uniswap/sdk-core'
import { atom } from 'jotai'

export interface LimitRateState {
  readonly isLoading: boolean
  readonly isLoadingExecutionRate: boolean
  readonly isInversed: boolean
  readonly activeRate: Fraction | null
  readonly executionRate: Fraction | null
  readonly isTypedValue: boolean
  readonly typedValue: string | null
}

const initLimitRateState = () => ({
  isInversed: false,
  isLoading: false,
  isLoadingExecutionRate: false,
  activeRate: null,
  executionRate: null,
  isTypedValue: false,
  typedValue: null,
})

export const limitRateAtom = atom<LimitRateState>(initLimitRateState())

export const updateLimitRateAtom = atom(null, (get, set, nextState: Partial<LimitRateState>) => {
  set(limitRateAtom, () => {
    const prevState = get(limitRateAtom)

    return { ...prevState, ...nextState }
  })
})
