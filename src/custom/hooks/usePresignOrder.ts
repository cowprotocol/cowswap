import { useCallback } from 'react'
import { useTransactionAdder } from '@src/state/transactions/hooks'

import { useGP2SettlementContract } from 'hooks/useContract'
import { ContractTransaction } from 'ethers'

export type PresignOrderFn = (orderId: string) => Promise<ContractTransaction>

export function usePresignOrder(): ((orderId: string) => Promise<ContractTransaction>) | null {
  const addTransaction = useTransactionAdder()
  const settlementContract = useGP2SettlementContract()

  const presignOrder = useCallback<PresignOrderFn>(
    async (orderId) => {
      console.log('Presigning order', orderId)

      if (!settlementContract) {
        throw Error('SettlementContract is not ready')
      }

      console.log('settlementContract', settlementContract)
      const txReceipt = await settlementContract.setPreSignature(orderId, true)
      addTransaction(txReceipt, { summary: `Presign order ${orderId}` })
      console.log('Sent transaction for presigning', orderId, txReceipt)

      return txReceipt
    },
    [addTransaction, settlementContract]
  )

  return settlementContract && presignOrder
}
