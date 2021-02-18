import { useCallback } from 'react'
import { CurrencyAmount } from '@uniswap/sdk'

import { useTransactionAdder } from '@src/state/transactions/hooks'

import { useWETHContract } from 'hooks/useContract'
import { DEFAULT_PRECISION } from '../constants'

export function useWrapEther() {
  const addTransaction = useTransactionAdder()
  const weth = useWETHContract()

  const wrapCallback = useCallback(
    async (amount: CurrencyAmount): Promise<string | undefined> => {
      console.log('Wrapping ETH!', amount.raw.toString(), weth)

      if (!weth) {
        // callback not reachable anyway when `weth` is not set
        // condition here to satisfy TS
        return
      }

      try {
        const txReceipt = await weth.deposit({ value: `0x${amount.raw.toString(16)}` })
        addTransaction(txReceipt, { summary: `Wrap ${amount.toSignificant(DEFAULT_PRECISION)} ETH to WETH` })
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
