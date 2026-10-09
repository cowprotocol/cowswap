import { useCallback } from 'react'

import { isSolanaAddress } from '@cowprotocol/cow-sdk'
import { useSolanaWalletProvider, useWalletInfo } from '@cowprotocol/wallet'

import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { PublicKey } from '@solana/web3.js'
import { buildSolanaCancelOrderParams } from 'tradingSdk/solana/buildSolanaCancelOrderParams'
import { SOLANA_TRADING_ENV } from 'tradingSdk/solanaTradingEnv'
import { solanaTradingSdk } from 'tradingSdk/solanaTradingSdk'

import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'
import { Order } from 'legacy/state/orders/actions'
import { useRequestOrderCancellation, useSetOrderCancellationHash } from 'legacy/state/orders/hooks'

// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { sendSolanaTransaction } from 'modules/trade/services/solanaSend/sendSolanaTransaction' // TODO: Don't use 'modules' import. Move it to common

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
      const [cancelParams] = await buildSolanaCancelOrderParams(
        connection,
        owner,
        [{ id: order.id, order }],
        SOLANA_TRADING_ENV,
      )
      const instruction = solanaTradingSdk.cancelOrder(cancelParams)

      const { hash } = await sendSolanaTransaction(connection, provider, owner, [instruction])

      cancelPendingOrder({ id: order.id, chainId })
      setOrderCancellationHash({ chainId, id: order.id, hash })
      addTransaction({
        hash,
        onChainCancellation: { orderId: order.id, sellTokenSymbol: order.inputToken.symbol || '' },
      })
    },
    [account, provider, connection, chainId, cancelPendingOrder, setOrderCancellationHash, addTransaction],
  )
}
