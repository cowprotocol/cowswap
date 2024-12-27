import { calculateGasMargin } from '@cowprotocol/common-utils'
import type { TransactionRequest } from '@ethersproject/abstract-provider'
import type { Deferrable } from '@ethersproject/properties'
import type { Web3Provider } from '@ethersproject/providers'

import useSWR from 'swr'

import type { SWRConfiguration } from 'swr'

type ITransactionData = Deferrable<TransactionRequest>

type IHookGasCalculator = (transactionData: ITransactionData) => Promise<string>

const useHookGasLimitCalculator = (provider: Web3Provider | undefined): IHookGasCalculator => {
  return async (transactionData) => {
    if (!provider) throw new Error('Provider is not defined')
    const gasEstimation = await provider.estimateGas(transactionData)
    return calculateGasMargin(gasEstimation).toString()
  }
}

export const useGasLimit = (
  provider: Web3Provider | undefined,
  transactionData: ITransactionData,
  swrConfig?: SWRConfiguration,
) => {
  const gasCalculator = useHookGasLimitCalculator(provider)

  return useSWR<string | undefined>(transactionData, gasCalculator, swrConfig)
}
