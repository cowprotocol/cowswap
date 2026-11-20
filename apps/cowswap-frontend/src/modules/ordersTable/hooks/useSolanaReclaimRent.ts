import { useCallback } from 'react'

import { backendEnv } from '@cowprotocol/common-utils'
import { isSolanaAddress } from '@cowprotocol/cow-sdk'
import { useSolanaWalletProvider, useWalletInfo } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'
import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { PublicKey } from '@solana/web3.js'
import { buildSolanaReclaimOrderParams, SolanaOrderToReclaim } from 'tradingSdk/solana/buildSolanaReclaimOrderParams'
import { solanaTradingSdk } from 'tradingSdk/solanaTradingSdk'

import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

import { sendSolanaTransaction } from 'modules/trade'

/**
 * Closes the on-chain accounts of orders that were cancelled before they expired, which returns the rent
 * their owner paid to create them. The reclaim cron only reaches an order once it has expired, so until
 * then the owner's own signature is the only way to get that rent back.
 */
export function useSolanaReclaimRent(): (orders: SolanaOrderToReclaim[]) => Promise<void> {
  const { account } = useWalletInfo()
  const provider = useSolanaWalletProvider()
  const { connection } = useAppKitConnection()
  const addTransaction = useTransactionAdder()

  return useCallback(
    async (orders: SolanaOrderToReclaim[]) => {
      if (!provider || !connection || !isSolanaAddress(account)) {
        throw new Error(t`Wallet not connected`)
      }

      const owner = new PublicKey(account)
      const reclaimable = await buildSolanaReclaimOrderParams(connection, owner, orders, backendEnv)

      if (!reclaimable.length) {
        throw new Error(t`There is no rent left to reclaim`)
      }

      const instructions = solanaTradingSdk.reclaimOrders(reclaimable.map(({ params }) => params))
      const { hash, blockhash, lastValidBlockHeight } = await sendSolanaTransaction(
        connection,
        provider,
        owner,
        instructions,
      )

      addTransaction({ hash, summary: t`Reclaim rent of cancelled orders` })

      // Submitting is not landing, and the caller drops the order from its list on success: resolving
      // here would hide an entry whose rent is still on-chain, with nothing left to re-check it.
      const { value } = await connection.confirmTransaction({ signature: hash, blockhash, lastValidBlockHeight })

      if (value.err) {
        throw new Error(t`The reclaim transaction failed on-chain`)
      }
    },
    [account, provider, connection, addTransaction],
  )
}
