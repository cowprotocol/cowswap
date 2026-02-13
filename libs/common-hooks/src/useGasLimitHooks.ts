import { calculateGasMargin } from '@cowprotocol/common-utils'
import type { TransactionRequest } from '@ethersproject/abstract-provider'
import { BigNumber } from '@ethersproject/bignumber'
import type { Deferrable } from '@ethersproject/properties'
import type { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'

import useSWR from 'swr'
import { Address, Hex } from 'viem'
import { useConfig } from 'wagmi'
import { estimateGas } from 'wagmi/actions'

import type { SWRConfiguration } from 'swr'

type ITransactionData = Deferrable<TransactionRequest>

type IHookGasCalculator = (transactionData: ITransactionData) => Promise<string>

export function useWalletProvider(): Web3Provider | undefined {
  const { provider } = useWeb3React()

  return provider
}

export const useHookGasLimitCalculator = (): IHookGasCalculator => {
  const config = useConfig()

  return async (transactionData) => {
    const gasEstimation = await estimateGas(config, {
      to: transactionData.to as Address,
      data: transactionData.data as Hex,
    })
    return calculateGasMargin(BigNumber.from(gasEstimation)).toString()
  }
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const useGasLimit = (transactionData: ITransactionData, swrConfig?: SWRConfiguration) => {
  const gasCalculator = useHookGasLimitCalculator()

  return useSWR<string | undefined>(transactionData, gasCalculator, swrConfig)
}
