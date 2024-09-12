import { useCallback, useEffect, useState } from 'react'

import { calculateGasMargin } from '@cowprotocol/common-utils'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import { CowHook } from 'modules/appData/types'

type ITransactionData = Omit<CowHook, 'gasLimit'>

type IHookGasCalculator = (transactionData: ITransactionData) => Promise<string>

export const useHookGasLimitCalculator = (): IHookGasCalculator => {
  const provider = useWalletProvider()

  return async (transactionData: Omit<CowHook, 'gasLimit'>) => {
    if (!provider) throw new Error('Provider is not defined')
    const gasEstimation = await provider.estimateGas({ to: transactionData.target, data: transactionData.callData })
    return calculateGasMargin(gasEstimation).toString()
  }
}

export const useGasLimit = (to?: string, calldata?: string): string | undefined => {
  const [gasLimit, setGasLimit] = useState<string>()

  const gasCalculator = useHookGasLimitCalculator()

  useEffect(() => {
    if (!to || !calldata) return
    gasCalculator({ target: to, callData: calldata }).then(setGasLimit)
  }, [to, calldata])

  return gasLimit
}
