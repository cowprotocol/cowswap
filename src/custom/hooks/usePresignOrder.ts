import { useCallback } from 'react'

import { useGP2SettlementContract } from 'hooks/useContract'
import { ContractTransaction, ethers } from 'ethers'
import { calculateGasMargin } from 'utils/calculateGasMargin'
import { useActiveWeb3React } from 'hooks/web3'

// Use a 150K gas as a fallback if there's issue calculating the gas estimation (fixes some issues with some nodes failing to calculate gas costs for SC wallets)
const PRESIGN_GAS_LIMIT_DEFAULT = ethers.BigNumber.from('150000')

export type PresignOrder = (orderId: string) => Promise<ContractTransaction>

export function usePresignOrder(): PresignOrder | null {
  const { chainId } = useActiveWeb3React()
  const settlementContract = useGP2SettlementContract()

  const presignOrder = useCallback<PresignOrder>(
    async (orderId) => {
      console.log('Pre-signing order', orderId)
      if (!chainId) {
        throw Error('Not connected to any chain')
      }

      if (!settlementContract) {
        throw Error('SettlementContract is not ready')
      }

      const estimatedGas = await settlementContract.estimateGas.setPreSignature(orderId, true).catch((error) => {
        console.error(
          '[usePresignOrder] Error estimating setPreSignature gas. Using default ' + PRESIGN_GAS_LIMIT_DEFAULT,
          error
        )
        return PRESIGN_GAS_LIMIT_DEFAULT
      })

      const txReceipt = await settlementContract.setPreSignature(orderId, true, {
        gasLimit: calculateGasMargin(chainId, estimatedGas),
      })

      console.log('Sent transaction for presigning', orderId, txReceipt)

      return txReceipt
    },
    [settlementContract, chainId]
  )

  return settlementContract && presignOrder
}
