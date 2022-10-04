import { atomWithStorage } from 'jotai/utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { WRAPPED_NATIVE_CURRENCY as WETH } from 'constants/tokens'
import { useAtom } from 'jotai'
import { useMemo } from 'react'
import { parameterizeLimitOrdersRoute } from '@src/cow-react/modules/limitOrders/hooks/useParameterizeLimitOrdersRoute'
import { useHistory } from 'react-router-dom'
import { useApplyLimitRate } from '../hooks/useApplyLimitRate'
import { Field } from 'state/swap/actions'

export interface LimitOrdersState {
  readonly chainId: number | null
  readonly inputCurrencyId: string | null
  readonly outputCurrencyId: string | null
  readonly inputCurrencyAmount: string | null
  readonly outputCurrencyAmount: string | null
  readonly recipient: string | null
}

export interface LimitOrdersStateManager {
  state: LimitOrdersState
  setState(state: LimitOrdersState): void
  setInputCurrencyAmount(inputCurrencyAmount: string | null): void
  setOutputCurrencyAmount(outputCurrencyAmount: string | null): void
  setRecipient(recipient: string | null): void
  navigate(
    chainId: SupportedChainId | null | undefined,
    outputCurrencyId: string | null,
    inputCurrencyId: string | null
  ): void
}

export function getDefaultLimitOrdersState(chainId: SupportedChainId | null): LimitOrdersState {
  return {
    chainId,
    inputCurrencyId: chainId ? WETH[chainId]?.symbol || null : null,
    outputCurrencyId: null,
    inputCurrencyAmount: null,
    outputCurrencyAmount: null,
    recipient: null,
  }
}

export const limitOrdersAtom = atomWithStorage<LimitOrdersState>('limit-orders-atom', getDefaultLimitOrdersState(null))

export const useLimitOrdersStateManager = (): LimitOrdersStateManager => {
  const history = useHistory()
  const applyLimitRate = useApplyLimitRate()
  const [state, setState] = useAtom(limitOrdersAtom)

  return useMemo(() => {
    return {
      state,
      setState(state: LimitOrdersState) {
        setState(state)
      },
      setInputCurrencyAmount(inputCurrencyAmount: string | null) {
        const newState = { ...state, inputCurrencyAmount }
        const outputWithRate = applyLimitRate(inputCurrencyAmount, Field.INPUT)
        if (outputWithRate) newState.outputCurrencyAmount = outputWithRate
        setState(newState)
      },
      setOutputCurrencyAmount(outputCurrencyAmount: string | null) {
        const newState = { ...state, outputCurrencyAmount }
        const inputWithRate = applyLimitRate(outputCurrencyAmount, Field.OUTPUT)
        if (inputWithRate) newState.inputCurrencyAmount = inputWithRate
        setState(newState)
      },
      setRecipient(recipient: string | null) {
        setState({ ...state, recipient })
      },
      navigate(
        chainId: SupportedChainId | null | undefined,
        outputCurrencyId: string | null,
        inputCurrencyId: string | null
      ) {
        const route = parameterizeLimitOrdersRoute(chainId, outputCurrencyId, inputCurrencyId)

        history.push(route)
      },
    }
  }, [state, setState, applyLimitRate, history])
}
