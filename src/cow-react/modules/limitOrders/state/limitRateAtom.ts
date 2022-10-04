import { useMemo } from 'react'
import { atomWithStorage } from 'jotai/utils'
import { useAtom } from 'jotai'
import { Field } from 'state/swap/actions'

export interface LimitRateState {
  readonly isLoading: boolean
  readonly primaryField: Field
  readonly rateValue: string | number | null
}

export interface LimitRateStateManager {
  state: LimitRateState
  setState(state: LimitRateState): void
  setPrimaryField(field: Field): void
  setRateValue(rateValue: string | number | null): void
  updateRate(rateValue: string | number | null): void
}

const initLimitRateState = () => ({
  isLoading: false,
  primaryField: Field.INPUT,
  rateValue: null,
})

export const limitRateAtom = atomWithStorage<LimitRateState>('limit-rate-state', initLimitRateState())

export const useLimitRateStateManager = (): LimitRateStateManager => {
  const [state, setState] = useAtom(limitRateAtom)

  return useMemo(() => {
    return {
      state,
      setState(state: LimitRateState) {
        setState(state)
      },
      setPrimaryField(primaryField: Field) {
        setState({ ...state, primaryField })
      },
      setRateValue(rateValue: string | number | null) {
        setState({ ...state, rateValue })
      },
      updateRate(rateValue: string | number | null) {
        setState({ ...state, rateValue })
      },
      setIsLoading(isLoading: boolean) {
        setState({ ...state, isLoading })
      },
    }
  }, [state, setState])
}
