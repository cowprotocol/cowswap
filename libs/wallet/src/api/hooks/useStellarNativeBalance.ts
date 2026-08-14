import { useMemo } from 'react'

import { useQuery } from '@tanstack/react-query'

import { IS_STELLAR_ENABLED } from '@cowprotocol/common-const'

import ms from 'ms.macro'

import { getStellarServer, isValidStellarAddress } from '../../stellar/stellarClient'

const STELLAR_NATIVE_DECIMALS = 7
const STELLAR_NATIVE_SYMBOL = 'XLM'

// Mirror the EVM/Solana native-balance poll cadence so all chains refresh alike.
const BALANCE_REFETCH_INTERVAL = ms`11s`

interface StellarBalanceResult {
  /** Native XLM balance in stroops (1 XLM = 10^7 stroops). */
  value: bigint
  decimals: number
  symbol: string
}

interface UseStellarNativeBalanceParams {
  /** Stellar public key (G... address). */
  account?: string
  enabled?: boolean
}

/**
 * Fetches the native XLM balance for a Stellar account via Horizon.
 *
 * Returns `undefined` when the feature flag is off, no account is provided,
 * or the account does not exist on-chain (unfunded).
 */
export function useStellarNativeBalance({
  account,
  enabled,
}: UseStellarNativeBalanceParams): StellarBalanceResult | undefined {
  const isEnabled = Boolean(IS_STELLAR_ENABLED && enabled && account && isValidStellarAddress(account))

  const queryKey = useMemo(() => ['stellarNativeBalance', account] as const, [account])

  const { data } = useQuery({
    queryKey,
    queryFn: async (): Promise<StellarBalanceResult> => {
      const server = getStellarServer()
      if (!server || !account) {
        return { value: BigInt(0), decimals: STELLAR_NATIVE_DECIMALS, symbol: STELLAR_NATIVE_SYMBOL }
      }

      const accountInfo = await server.loadAccount(account)
      const nativeBalance = accountInfo.balances.find(
        (b): b is Extract<typeof b, { asset_type: 'native' }> => b.asset_type === 'native',
      )

      // Horizon returns balance as a decimal string (e.g. "100.0000000").
      // Convert to stroops (smallest unit) for consistency with EVM/Solana bigint patterns.
      const balanceStr = nativeBalance?.balance ?? '0'
      const [whole = '0', fraction = ''] = balanceStr.split('.')
      const paddedFraction = fraction.padEnd(STELLAR_NATIVE_DECIMALS, '0').slice(0, STELLAR_NATIVE_DECIMALS)
      const stroops = BigInt(whole) * BigInt(10 ** STELLAR_NATIVE_DECIMALS) + BigInt(paddedFraction)

      return { value: stroops, decimals: STELLAR_NATIVE_DECIMALS, symbol: STELLAR_NATIVE_SYMBOL }
    },
    enabled: isEnabled,
    refetchInterval: BALANCE_REFETCH_INTERVAL,
  })

  return data
}
