import { useMemo } from 'react'
import { useAtom, atom } from 'jotai'

export interface LimitRateState {
  readonly isLoading: boolean
  readonly isInversed: boolean
  readonly activeRate: string | null
  readonly marketRate: string | null
}

export interface LimitRateStateManager {
  state: LimitRateState
  setState(state: LimitRateState): void
  setIsInversed(isInversed: boolean, activeRate: string | null): void
  setActiveRate(value: string | null): void
  setMarketRate(value: string | null): void
}

const initLimitRateState = () => ({
  isInversed: false,
  isLoading: false,
  activeRate: null,
  // TODO: set this to null, this is just for testing purposes
  marketRate: '2',
})

export const limitRateAtom = atom<LimitRateState>(initLimitRateState())

export const useLimitRateStateManager = (): LimitRateStateManager => {
  const [state, setState] = useAtom(limitRateAtom)

  return useMemo(() => {
    return {
      state,
      setState(state: LimitRateState) {
        setState(state)
      },
      setIsInversed(isInversed: boolean, activeRate: string | null) {
        setState({ ...state, isInversed, activeRate })
      },
      setActiveRate(activeRate: string | null) {
        setState({ ...state, activeRate })
      },
      setMarketRate(marketRate: string | null) {
        setState({ ...state, marketRate })
      },
      setIsLoading(isLoading: boolean) {
        setState({ ...state, isLoading })
      },
    }
  }, [state, setState])
}
