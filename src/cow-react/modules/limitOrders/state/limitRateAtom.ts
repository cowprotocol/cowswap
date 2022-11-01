import { atom } from 'jotai'

export interface LimitRateState {
  readonly isLoading: boolean
  readonly isInversed: boolean
  readonly activeRate: string | null
  readonly executionRate: string | null
}

const initLimitRateState = () => ({
  isInversed: false,
  isLoading: false,
  activeRate: null,
  executionRate: null,
})

export const limitRateAtom = atom<LimitRateState>(initLimitRateState())

export const updateLimitRateAtom = atom(null, (get, set, nextState: Partial<LimitRateState>) => {
  set(limitRateAtom, () => {
    const prevState = get(limitRateAtom)

    return { ...prevState, ...nextState }
  })
})
