import { useCallback } from 'react'

import { useGP2SettlementContract } from 'hooks/useContract'
import { ContractTransaction } from '@ethersproject/contracts'

export type PresignOrder = (orderId: string) => Promise<ContractTransaction>

export function usePresignOrder(): PresignOrder | null {
  const settlementContract = useGP2SettlementContract()

  const presignOrder = useCallback<PresignOrder>(
    async (orderId) => {
      console.log('Presigning order', orderId)

      if (!settlementContract) {
        throw Error('SettlementContract is not ready')
      }

      const txReceipt = await settlementContract.setPreSignature(orderId, true)

      console.log('Sent transaction for presigning', orderId, txReceipt)

      return txReceipt
    },
    [settlementContract]
  )

  return settlementContract && presignOrder
}
