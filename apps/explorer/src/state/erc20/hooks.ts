import { useCallback, useMemo } from 'react'

import { TokenErc20 } from '@gnosis.pm/dex-js'

import { Network } from 'types'

import useGlobalState from 'hooks/useGlobalState'

import { buildErc20Key, Erc20State } from '.'
import { saveMultipleErc20 } from './actions'

export type SingleErc20State = TokenErc20 | null

type UseErc20Params = {
  address?: string
  networkId?: Network
}

/**
 * Syntactic sugar to get erc20 from global state
 */
export const useErc20 = <State extends { erc20s: Erc20State }>(params: UseErc20Params): SingleErc20State => {
  const { address, networkId } = params

  const [{ erc20s }] = useGlobalState<State>()

  return useMemo(() => {
    if (!address || !networkId) {
      return null
    }
    return erc20s.get(buildErc20Key(networkId, address)) || null
  }, [address, erc20s, networkId])
}

type UseMultipleErc20Params = {
  addresses: string[]
  networkId?: Network
}

/**
 * Syntactic sugar to get erc20s from global state
 */
export const useMultipleErc20s = <State extends { erc20s: Erc20State }>(
  params: UseMultipleErc20Params,
): Record<string, TokenErc20> => {
  const { addresses, networkId } = params
  const [{ erc20s }] = useGlobalState<State>()

  return useMemo(() => {
    if (!networkId) {
      return {}
    }

    return addresses.reduce((acc, address) => {
      const key = buildErc20Key(networkId, address)
      const erc20 = erc20s.get(key)

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
export const useSaveErc20s = <State extends { erc20s: Erc20State }>(
  networkId?: Network,
): ((erc20s: TokenErc20[]) => void) => {
  const [, dispatch] = useGlobalState<State>()

  return useCallback(
    (erc20s: TokenErc20[]): void => {
      networkId && dispatch(saveMultipleErc20(erc20s, networkId))
    },
    [dispatch, networkId],
  )
}
