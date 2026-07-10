import { useMemo } from 'react'

import { solana } from '@cowprotocol/cow-sdk'

import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import ms from 'ms.macro'

import type { UseBalanceReturnType } from 'wagmi'

const SOLANA_NATIVE_DECIMALS = solana.nativeCurrency.decimals
const SOLANA_NATIVE_SYMBOL = solana.nativeCurrency.symbol

// Mirror the EVM native-balance poll cadence (wagmi's `refetchInterval`) so both chains refresh alike.
const BALANCE_REFETCH_INTERVAL = ms`11s`

interface UseSolanaNativeBalanceParams {
  account?: string
  enabled?: boolean
}

/**
 * Solana counterpart to wagmi's `useBalance` for the native SOL balance.
 */
export function useSolanaNativeBalance({ account, enabled }: UseSolanaNativeBalanceParams): UseBalanceReturnType {
  const { connection } = useAppKitConnection()

  // `rpcEndpoint` keys the cache to the active network, so a chain switch does not surface a stale balance.
  const queryKey = useMemo(
    () => ['solanaNativeBalance', account, connection?.rpcEndpoint] as const,
    [account, connection?.rpcEndpoint],
  )

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const balance = await connection!.getBalance(new PublicKey(account!))

      return { decimals: SOLANA_NATIVE_DECIMALS, symbol: SOLANA_NATIVE_SYMBOL, value: BigInt(balance) }
    },
    enabled: Boolean(enabled) && Boolean(account) && Boolean(connection),
    refetchInterval: BALANCE_REFETCH_INTERVAL,
  })

  return useMemo(() => ({ ...query, queryKey }) as UseBalanceReturnType, [query, queryKey])
}
