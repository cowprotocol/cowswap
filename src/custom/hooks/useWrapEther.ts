import { useCallback } from 'react'
import { CurrencyAmount, Currency } from '@uniswap/sdk-core'

import { useTransactionAdder } from '@src/state/transactions/hooks'

import { useWETHContract } from 'hooks/useContract'
import { ContractTransaction } from 'ethers'
import { formatSmart } from '../utils/format'

export function useWrapEther() {
  const addTransaction = useTransactionAdder()
  const weth = useWETHContract()

  const wrapCallback = useCallback(
    async (amount: CurrencyAmount<Currency>): Promise<ContractTransaction | string | undefined> => {
      console.log('Wrapping ETH!', amount.quotient.toString(), weth)

      if (!weth) {
        // callback not reachable anyway when `weth` is not set
        // condition here to satisfy TS
        return
      }

      try {
        const txReceipt = await weth.deposit({ value: `0x${amount.quotient.toString(16)}` })
        addTransaction(txReceipt, { summary: `Wrap ${formatSmart(amount)} ETH to WETH` })
        console.log('Wrapped!', amount)
        return txReceipt
      } catch (error) {
        console.error('Could not WRAP', error)
        return 'Failed to wrap'
      }
    },
    [addTransaction, weth]
  )

  return weth && wrapCallback
}
