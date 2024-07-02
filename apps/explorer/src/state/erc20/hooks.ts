import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'

import { TokenErc20 } from '@gnosis.pm/dex-js'
import { Network } from 'types'

import { addLoadedTokensToChainAtom, tokensLoadedFromChainAtom } from './atoms'

export type SingleErc20State = TokenErc20 | null

type UseMultipleErc20Params = {
  addresses: string[]
  networkId?: Network
}

/**
 * Syntactic sugar to get erc20s from global state
 */
export function useMultipleErc20s(params: UseMultipleErc20Params): Record<string, TokenErc20> {
  const { addresses, networkId } = params
  const allErc20s = useAtomValue(tokensLoadedFromChainAtom)
  const erc20s = networkId && allErc20s[networkId]

  return useMemo(() => {
    if (!networkId || !erc20s) {
      return {}
    }

    return addresses.reduce((acc, address) => {
      const erc20 = erc20s[address.toLowerCase()]

      if (erc20) {
        acc[address] = erc20
      }

      return acc
    }, {})
  }, [addresses, erc20s, networkId])
}

/**
 * Syntactic sugar to save erc20s to global state
 * Returns a function that takes a list of TokenErc20 objects as parameter
 *
 * @param networkId The network id
 */
export function useSaveErc20s(networkId?: Network): (erc20s: TokenErc20[]) => void {
  const addLoadedTokensToChain = useSetAtom(addLoadedTokensToChainAtom)

  return useCallback(
    (erc20s: TokenErc20[]): void => {
      networkId && addLoadedTokensToChain({ chainId: networkId, tokens: erc20s })
    },
    [addLoadedTokensToChain, networkId]
  )
}
