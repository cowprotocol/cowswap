import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { erc20Abi } from 'viem'
import { useReadContracts } from 'wagmi'

import { getAddressKey, isSolanaChain } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import ms from 'ms.macro'

import { useTradeSpenderAddress } from './useTradeSpenderAddress'

import { allowancesAtom } from '../state/allowancesAtom'

export type AllowancesState = Record<string, bigint | undefined>

export function useTokenAllowances(tokenAddresses: string[]): {
  state: AllowancesState | undefined
  isLoading: boolean
} {
  /*
  TODO: Replace with tokenAllowancesFamily

  const loadable = useLoadable(tokenAllowancesFamily(tokenAddresses))
  const isLoading = loadable.state === 'loading'
  const state = loadable.state === 'hasData' ? loadable.data : undefined
  return { state, isLoading }
  */

  const { chainId, account } = useWalletInfo()
  const isSolana = isSolanaChain(chainId)

  const spender = useTradeSpenderAddress()

  // On Solana there is no ERC20 `allowance` to read on-chain: the SPL delegation stands in for it. It is
  // fetched off the token account and persisted into `allowancesAtom` by `usePersistSplDataMulticall`, so
  // read it from the atom here instead of the wagmi call below (which is EVM-only). No separate loading
  // signal is tracked, matching the EVM path (which gets `isLoading` inline from wagmi).
  const persistedAllowancesByChain = useAtomValue(allowancesAtom)

  const { data: allowances, isLoading } = useReadContracts({
    contracts: tokenAddresses.map((address) => ({
      abi: erc20Abi,
      address: address as `0x${string}`,
      chainId,
      functionName: 'allowance',
      args: [account as `0x${string}`, spender as `0x${string}`],
    })),
    query: {
      enabled: !isSolana && !!account && !!spender && tokenAddresses.length > 0,
      refetchInterval: ms`32s`,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  })

  const state = useMemo(() => {
    // Solana: the SPL delegation for the active chain is already a ready allowances map (no per-token
    // decode needed), so it slots in as its own branch of the same computation.
    if (isSolana) return persistedAllowancesByChain[chainId]

    if (!allowances?.length) return

    return tokenAddresses.reduce<AllowancesState>((acc, address, index) => {
      const result = allowances[index]?.result

      acc[getAddressKey(address)] = result !== undefined ? (result as bigint) : undefined

      return acc
    }, {})
  }, [isSolana, persistedAllowancesByChain, chainId, tokenAddresses, allowances])

  // EVM loading comes from wagmi. Solana has no allowance-loading signal for now; it will be added later.
  return useMemo(() => ({ state, isLoading: isSolana ? false : isLoading }), [state, isSolana, isLoading])
}
