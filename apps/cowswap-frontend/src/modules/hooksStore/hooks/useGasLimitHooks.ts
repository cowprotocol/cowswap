import { calculateGasMargin } from '@cowprotocol/common-utils'
import { useWalletProvider } from '@cowprotocol/wallet-provider'
import type { TransactionRequest } from '@ethersproject/abstract-provider'
import type { Deferrable } from '@ethersproject/properties'

import useSWR from 'swr'
import { SWRConfiguration } from 'swr'

type ITransactionData = Deferrable<TransactionRequest>

type IHookGasCalculator = (transactionData: ITransactionData) => Promise<string>

export const useHookGasLimitCalculator = (): IHookGasCalculator => {
  const provider = useWalletProvider()

  return async (transactionData) => {
    if (!provider) throw new Error('Provider is not defined')
    const gasEstimation = await provider.estimateGas(transactionData)
    return calculateGasMargin(gasEstimation).toString()
  }
}

export const useGasLimit = (transactionData: ITransactionData, swrConfig?: SWRConfiguration) => {
  const gasCalculator = useHookGasLimitCalculator()

  return useSWR<string | undefined>(transactionData, gasCalculator, swrConfig)
}
