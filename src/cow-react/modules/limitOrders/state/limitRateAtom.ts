import { atom } from 'jotai'

export interface LimitRateState {
  readonly isLoading: boolean
  readonly isInversed: boolean
  readonly activeRate: string | null
  readonly marketRate: string | null
}

const initLimitRateState = () => ({
  isInversed: false,
  isLoading: false,
  activeRate: null,
  // TODO: set this to null, this is just for testing purposes
  marketRate: '2',
})

export const limitRateAtom = atom<LimitRateState>(initLimitRateState())

export const updateLimitRateAtom = atom(null, (get, set, nextState: Partial<LimitRateState>) => {
  set(limitRateAtom, () => {
    const prevState = get(limitRateAtom)

    return { ...prevState, ...nextState }
  })
})
