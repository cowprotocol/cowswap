import { useCallback } from 'react'
import { useTransactionAdder } from '@src/state/transactions/hooks'

import { useGP2SettlementContract } from 'hooks/useContract'
import { ContractTransaction } from 'ethers'

export type PresignOrderResult = ContractTransaction | string | undefined
export type PresignOrderFn = (orderId: string) => Promise<PresignOrderResult>

export function usePresignOrder(): ((orderId: string) => Promise<PresignOrderResult>) | null {
  const addTransaction = useTransactionAdder()
  const settlementContract = useGP2SettlementContract()

  const presignOrder = useCallback<PresignOrderFn>(
    async (orderId: string): Promise<PresignOrderResult> => {
      console.log('Presigning order', orderId)

      if (!settlementContract) {
        return 'SettlementContract is not ready'
      }

      try {
        const txReceipt = await settlementContract.setPreSignature(orderId, true)
        addTransaction(txReceipt, { summary: `Presign order ${orderId}` })
        console.log('Sent transaction for presigning', orderId, txReceipt)
        return txReceipt
      } catch (error) {
        console.error('Could not presign', error)
        return 'Failed to presign' + (error.message ? `: ${error.message}` : '')
      }
    },
    [addTransaction, settlementContract]
  )

  return settlementContract && presignOrder
}
