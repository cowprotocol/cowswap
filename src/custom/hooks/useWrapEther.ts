import { useCallback } from 'react'
import { CurrencyAmount, Currency } from '@uniswap/sdk-core'

import { useTransactionAdder } from 'state/enhancedTransactions/hooks'

import { useWETHContract } from 'hooks/useContract'
import { ContractTransaction } from '@ethersproject/contracts'
import { formatSmart } from '../utils/format'
import { AMOUNT_PRECISION } from 'constants/index'

export type Wrap = (amount: CurrencyAmount<Currency>) => Promise<ContractTransaction | string>

export function useWrapEther() {
  const addTransaction = useTransactionAdder()
  const weth = useWETHContract()

  const wrapCallback = useCallback<Wrap>(
    async (amount) => {
      console.log('Wrapping ETH!', amount.quotient.toString(), weth)

      if (!weth) {
        // callback not reachable anyway when `weth` is not set
        // condition here to satisfy TS
        return 'WETH not initialized'
      }

      try {
        const txReceipt = await weth.deposit({ value: `0x${amount.quotient.toString(16)}` })
        addTransaction({
          hash: txReceipt.hash,
          summary: `Wrap ${formatSmart(amount, AMOUNT_PRECISION)} ETH to WETH`,
        })
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
