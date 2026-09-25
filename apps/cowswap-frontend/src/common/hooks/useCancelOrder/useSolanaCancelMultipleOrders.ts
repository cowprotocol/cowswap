import { useCallback } from 'react'

import { hexToBytes } from 'viem'

import { isBarnBackendEnv } from '@cowprotocol/common-utils'
import { isSolanaAddress } from '@cowprotocol/cow-sdk'
import { findOrderPda, getSolanaSettlementProgramId, SolanaTradingSdk } from '@cowprotocol/sdk-trading-solana'
import { useSolanaWalletProvider, useWalletInfo } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'
import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { PublicKey } from '@solana/web3.js'

import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'
import { useSetOrderCancellationHash } from 'legacy/state/orders/hooks'

// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { sendSolanaTransaction } from 'modules/trade/services/solanaSend/sendSolanaTransaction' // TODO: Don't use 'modules' import

import { CancellableOrder, isOrderCancellable } from 'common/utils/isOrderCancellable'

const SOLANA_CANCEL_ENV = isBarnBackendEnv ? 'staging' : 'prod'

// Solana has no dedicated batch-cancel instruction: cancelling several orders together means bundling
// one CancelOrder instruction per order into a single transaction, signed once.
export function useSolanaCancelMultipleOrders(): (orders: CancellableOrder[]) => Promise<void> {
  const { account, chainId } = useWalletInfo()
  const provider = useSolanaWalletProvider()
  const { connection } = useAppKitConnection()
  const setOrderCancellationHash = useSetOrderCancellationHash()
  const addTransaction = useTransactionAdder()

  return useCallback(
    async (ordersToCancel: CancellableOrder[]) => {
      const notCancellableOrders = ordersToCancel.filter((order) => !isOrderCancellable(order))

      if (notCancellableOrders.length) {
        throw new Error(t`Some orders can not be cancelled!`)
      }

      if (!provider || !connection || !isSolanaAddress(account)) {
        throw new Error(t`Wallet not connected`)
      }

      const owner = new PublicKey(account)
      const programId = getSolanaSettlementProgramId(SOLANA_CANCEL_ENV)
      const sdk = new SolanaTradingSdk({ env: SOLANA_CANCEL_ENV })

      const instructions = sdk.cancelOrders(
        ordersToCancel.map((order) => {
          const [orderPda] = findOrderPda(programId, hexToBytes(order.id as `0x${string}`), SOLANA_CANCEL_ENV)

          return { ownerAddress: owner, orderPda }
        }),
      )

      const { hash } = await sendSolanaTransaction(connection, provider, owner, instructions)

      ordersToCancel.forEach((order) => {
        setOrderCancellationHash({ chainId, id: order.id, hash })
      })
      const ordersCount = ordersToCancel.length
      addTransaction({ hash, summary: t`Cancel ${ordersCount} orders` })
    },
    [account, provider, connection, chainId, setOrderCancellationHash, addTransaction],
  )
}
