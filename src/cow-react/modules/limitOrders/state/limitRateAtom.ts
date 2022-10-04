import { useMemo } from 'react'
import { useAtom, atom } from 'jotai'

export interface LimitRateState {
  readonly isLoading: boolean
  readonly isInversed: boolean
  readonly activeRate: number | null
  readonly marketRate: number | null
}

export interface LimitRateStateManager {
  state: LimitRateState
  setState(state: LimitRateState): void
  setIsInversed(isInversed: boolean, activeRate: number | null): void
  setActiveRate(value: number | null): void
  setMarketRate(value: number | null): void
}

const initLimitRateState = () => ({
  isInversed: false,
  isLoading: false,
  activeRate: null,
  marketRate: null,
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
      setIsInversed(isInversed: boolean, activeRate: number | null) {
        setState({ ...state, isInversed, activeRate })
      },
      setActiveRate(activeRate: number | null) {
        setState({ ...state, activeRate })
      },
      setMarketRate(marketRate: number | null) {
        setState({ ...state, marketRate })
      },
      setIsLoading(isLoading: boolean) {
        setState({ ...state, isLoading })
      },
    }
  }, [state, setState])
}
