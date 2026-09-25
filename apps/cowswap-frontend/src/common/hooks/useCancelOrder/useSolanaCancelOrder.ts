import { useCallback } from 'react'

import { hexToBytes } from 'viem'

import { isBarnBackendEnv, shortenOrderId } from '@cowprotocol/common-utils'
import { isSolanaAddress } from '@cowprotocol/cow-sdk'
import { findOrderPda, getSolanaSettlementProgramId, SolanaTradingSdk } from '@cowprotocol/sdk-trading-solana'
import { useSolanaWalletProvider, useWalletInfo } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'
import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { PublicKey } from '@solana/web3.js'

import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'
import { Order } from 'legacy/state/orders/actions'
import { useRequestOrderCancellation, useSetOrderCancellationHash } from 'legacy/state/orders/hooks'

// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { sendSolanaTransaction } from 'modules/trade/services/solanaSend/sendSolanaTransaction' // TODO: Don't use 'modules' import. Move it to common

const SOLANA_CANCEL_ENV = isBarnBackendEnv ? 'staging' : 'prod'

export function useSolanaCancelOrder(): (order: Order) => Promise<void> {
  const { account, chainId } = useWalletInfo()
  const provider = useSolanaWalletProvider()
  const { connection } = useAppKitConnection()
  const cancelPendingOrder = useRequestOrderCancellation()
  const setOrderCancellationHash = useSetOrderCancellationHash()
  const addTransaction = useTransactionAdder()

  return useCallback(
    async (order: Order): Promise<void> => {
      if (!provider || !connection || !isSolanaAddress(account)) {
        throw new Error('Solana wallet not connected')
      }

      const owner = new PublicKey(account)
      const programId = getSolanaSettlementProgramId(SOLANA_CANCEL_ENV)
      const [orderPda] = findOrderPda(programId, hexToBytes(order.id as `0x${string}`), SOLANA_CANCEL_ENV)

      const sdk = new SolanaTradingSdk({ env: SOLANA_CANCEL_ENV })
      const instruction = sdk.cancelOrder({ ownerAddress: owner, orderPda })

      const { hash } = await sendSolanaTransaction(connection, provider, owner, [instruction])

      cancelPendingOrder({ id: order.id, chainId })
      setOrderCancellationHash({ chainId, id: order.id, hash })
      // `checkSolanaTransaction`'s finalize notification reads `summary` directly (unlike the EVM path,
      // which derives its own text from `onChainCancellation` instead) - Solana needs it set explicitly.
      const shortOrderId = shortenOrderId(order.id)
      addTransaction({
        hash,
        summary: t`Cancel order ${shortOrderId}`,
        onChainCancellation: { orderId: order.id, sellTokenSymbol: order.inputToken.symbol || '' },
      })
    },
    [account, provider, connection, chainId, cancelPendingOrder, setOrderCancellationHash, addTransaction],
  )
}
