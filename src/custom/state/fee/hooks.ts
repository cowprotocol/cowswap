import { ChainId } from '@uniswap/sdk'
import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { AppDispatch, AppState } from 'state'
import { updateFee, clearFee } from './actions'
import { FeeInformation, FeesMap } from './reducer'

interface AddFeeParams extends ClearFeeParams {
  fee: FeeInformation
}
interface ClearFeeParams {
  token: string // token address,
  chainId: ChainId
}

type AddFeeCallback = (addTokenParams: AddFeeParams) => void
type ClearFeeCallback = (clearTokenParams: ClearFeeParams) => void

export const useAllFees = ({ chainId }: Partial<Pick<ClearFeeParams, 'chainId'>>): Partial<FeesMap> | undefined => {
  return useSelector<AppState, Partial<FeesMap> | undefined>(state => {
    const fees = chainId && state.fee[chainId]

    if (!fees) return {}

    return fees
  })
}

export const useFee = ({
  token,
  chainId
}: ClearFeeParams & Partial<Pick<ClearFeeParams, 'chainId'>>): FeeInformation | undefined => {
  return useSelector<AppState, FeeInformation | undefined>(state => {
    const fees = chainId && state.fee[chainId]

    if (!fees) return undefined

    return token ? fees[token]?.fee : undefined
  })
}

export const useAddFee = (): AddFeeCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((addTokenParams: AddFeeParams) => dispatch(updateFee(addTokenParams)), [dispatch])
}

export const useClearFee = (): ClearFeeCallback => {
  const dispatch = useDispatch<AppDispatch>()
  return useCallback((clearTokenParams: ClearFeeParams) => dispatch(clearFee(clearTokenParams)), [dispatch])
}
