import { calculateGasMargin } from '@cowprotocol/common-utils'

import useSWR from 'swr'
import { Address, Hex } from 'viem'
import { useConfig } from 'wagmi'
import { estimateGas } from 'wagmi/actions'

import type { SWRConfiguration } from 'swr'

type ITransactionData = {
  to?: Address
  data?: Hex
}

type IHookGasCalculator = (transactionData: ITransactionData) => Promise<string>

export const useHookGasLimitCalculator = (): IHookGasCalculator => {
  const config = useConfig()

  return async (transactionData) => {
    const gasEstimation = await estimateGas(config, {
      to: transactionData.to,
      data: transactionData.data,
    })
    return calculateGasMargin(gasEstimation).toString()
  }
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useGasLimit = (transactionData: ITransactionData, swrConfig?: SWRConfiguration) => {
  const gasCalculator = useHookGasLimitCalculator()

  return useSWR<string | undefined>(transactionData, gasCalculator, swrConfig)
}
