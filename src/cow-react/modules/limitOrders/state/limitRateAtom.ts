import { atom } from 'jotai'

export interface LimitRateState {
  readonly isLoading: boolean
  readonly isLoadingExecutionRate: boolean
  readonly isInversed: boolean
  readonly activeRate: string | null
  readonly executionRate: string | null
  readonly isTypedValue: boolean
}

const initLimitRateState = () => ({
  isInversed: false,
  isLoading: false,
  isLoadingExecutionRate: false,
  activeRate: null,
  executionRate: null,
  isTypedValue: false,
})

export const limitRateAtom = atom<LimitRateState>(initLimitRateState())

export const updateLimitRateAtom = atom(null, (get, set, nextState: Partial<LimitRateState>) => {
  set(limitRateAtom, () => {
    const prevState = get(limitRateAtom)

    return { ...prevState, ...nextState }
  })
})
