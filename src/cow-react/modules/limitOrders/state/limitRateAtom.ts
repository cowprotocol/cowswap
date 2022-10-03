import { useMemo } from 'react'
import { atomWithStorage } from 'jotai/utils'
import { useAtom } from 'jotai'
import { Field } from 'state/swap/actions'

export interface LimitRateState {
  readonly isLoading: boolean
  readonly isLocked: boolean
  readonly primaryField: Field
  readonly rateValue: string | number | null
}

export interface LimitRateStateManager {
  state: LimitRateState
  setState(state: LimitRateState): void
  setIsLocked(isLocked: boolean): void
  setPrimaryField(field: Field): void
  setRateValue(rateValue: string | number | null): void
}

const initLimitRateState = () => ({
  isLoading: false,
  isLocked: false,
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
      setIsLocked(isLocked: boolean) {
        setState({ ...state, isLocked })
      },
      setPrimaryField(primaryField: Field) {
        setState({ ...state, primaryField })
      },
      setRateValue(rateValue: string | number | null) {
        setState({ ...state, rateValue })
      },
      setIsLoading(isLoading: boolean) {
        setState({ ...state, isLoading })
      },
    }
  }, [state, setState])
}
