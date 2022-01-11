import { createContext, useContext, useMemo, useReducer } from 'react'
import reducer, { ClaimState, initialState } from './reducer'
import {
  ClaimActions,
  setInputAddress,
  setActiveClaimAccount,
  setActiveClaimAccountENS,
  setIsSearchUsed,
  setClaimConfirmed,
  setClaimAttempting,
  setClaimSubmitted,
  setClaimedAmount,
  setIsInvestFlowActive,
  setInvestFlowStep,
  setSelected,
  setSelectedAll,
} from './actions'

export const ClaimContext = createContext<{ state: ClaimState; dispatchers: ClaimActions | undefined }>({
  state: initialState,
  dispatchers: undefined,
})

export function useClaimReducer() {
  const [state, dispatch] = useReducer(reducer, initialState)

  return useMemo(() => {
    const dispatchers = {
      // account
      setInputAddress: (payload: string) => dispatch(setInputAddress(payload)),
      setActiveClaimAccount: (payload: string) => dispatch(setActiveClaimAccount(payload)),
      setActiveClaimAccountENS: (payload: string) => dispatch(setActiveClaimAccountENS(payload)),
      // search
      setIsSearchUsed: (payload: boolean) => dispatch(setIsSearchUsed(payload)),
      // claiming
      setClaimConfirmed: (payload: boolean) => dispatch(setClaimConfirmed(payload)),
      setClaimAttempting: (payload: boolean) => dispatch(setClaimAttempting(payload)),
      setClaimSubmitted: (payload: boolean) => dispatch(setClaimSubmitted(payload)),
      setClaimedAmount: (payload: number) => dispatch(setClaimedAmount(payload)),
      // investing
      setIsInvestFlowActive: (payload: boolean) => dispatch(setIsInvestFlowActive(payload)),
      setInvestFlowStep: (payload: number) => dispatch(setInvestFlowStep(payload)),
      // claim row selection
      setSelected: (payload: number[]) => dispatch(setSelected(payload)),
      setSelectedAll: (payload: boolean) => dispatch(setSelectedAll(payload)),
    }

    return { state, dispatchers }
  }, [state])
}

// The main state handling hook: uses the Context created here
export default function useClaimState() {
  return useContext(ClaimContext)
}
