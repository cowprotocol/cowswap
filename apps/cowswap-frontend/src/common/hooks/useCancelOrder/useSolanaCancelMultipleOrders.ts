import { useCallback } from 'react'

import { isSolanaAddress } from '@cowprotocol/cow-sdk'
import { useSolanaWalletProvider, useWalletInfo } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'
import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { PublicKey } from '@solana/web3.js'
import { SOLANA_TRADING_ENV, solanaTradingSdk } from 'tradingSdk/solanaTradingSdk'

import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'
import { useAllOrdersMap, useSetOrderCancellationHash } from 'legacy/state/orders/hooks'

// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { sendSolanaTransaction } from 'modules/trade/services/solanaSend/sendSolanaTransaction' // TODO: Don't use 'modules' import

import { CancellableOrder, isOrderCancellable } from 'common/utils/isOrderCancellable'

import { buildSolanaCancelOrderParams } from './buildSolanaCancelOrderParams'

// Solana has no dedicated batch-cancel instruction: cancelling several orders together means bundling
// one CancelOrder instruction per order into a single transaction, signed once.
export function useSolanaCancelMultipleOrders(): (orders: CancellableOrder[]) => Promise<void> {
  const { account, chainId } = useWalletInfo()
  const provider = useSolanaWalletProvider()
  const { connection } = useAppKitConnection()
  const setOrderCancellationHash = useSetOrderCancellationHash()
  const addTransaction = useTransactionAdder()
  const allOrders = useAllOrdersMap({ chainId })

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
      const cancelParams = await buildSolanaCancelOrderParams(
        connection,
        owner,
        ordersToCancel.map(({ id }) => ({ id, order: allOrders[id]?.order })),
        SOLANA_TRADING_ENV,
      )
      const instructions = solanaTradingSdk.cancelOrders(cancelParams)

      const { hash } = await sendSolanaTransaction(connection, provider, owner, instructions)

      ordersToCancel.forEach((order) => {
        setOrderCancellationHash({ chainId, id: order.id, hash })
      })
      addTransaction({ hash, solanaCancelOrderIds: ordersToCancel.map((order) => order.id) })
    },
    [account, provider, connection, chainId, allOrders, setOrderCancellationHash, addTransaction],
  )
}
