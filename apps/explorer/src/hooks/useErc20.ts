import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { TokenErc20 } from '@gnosis.pm/dex-js'

import { Errors, Network, UiError } from 'types'

import {
  useErc20 as useErc20State,
  useMultipleErc20s as useMultipleErc20sState,
  useSaveErc20s,
  SingleErc20State,
} from 'state/erc20'

import { getErc20Info } from 'services/helpers'

import { web3, erc20Api } from 'apps/explorer/api'

import { NATIVE_TOKEN_PER_NETWORK } from 'const'
import { isNativeToken, retry } from 'utils'

async function _fetchErc20FromNetwork(params: {
  address: string
  networkId: number
  setError: (error: UiError) => void
}): Promise<SingleErc20State> {
  const { address, networkId, setError } = params

  if (isNativeToken(address)) {
    // Default to mainnet (ETH) when the network isn't configured
    const nativeToken = NATIVE_TOKEN_PER_NETWORK[networkId] || NATIVE_TOKEN_PER_NETWORK[Network.MAINNET]
    // Overwrite native address because otherwise it won't match the case
    // Causing the caller to never know we got the token it was looking for
    return { ...nativeToken, address }
  }

  try {
    return await retry(() => getErc20Info({ tokenAddress: address, networkId, web3, erc20Api }))
  } catch (e) {
    const msg = `Failed to fetch erc20 details for ${address} on network ${networkId}`
    console.error(msg, e)
    setError({ message: msg, type: 'error' })
    // When failed, return null for given token
    return null
  }
}

type UseErc20Params = { address?: string; networkId?: Network }

type Return<E, V> = { isLoading: boolean; error?: E; value: V }

/**
 * Fetches single erc20 token details for given network and address
 *
 * Tries to get it from globalState.
 * If not found, tries to get it from the network.
 * Saves to globalState if found.
 * Value is `null` when not found.
 * Returns `isLoading` to indicate whether fetching the value
 * Returns `error` with the error message, if any.
 */
export function useErc20(params: UseErc20Params): Return<UiError, SingleErc20State> {
  const { address, networkId } = params

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<UiError>()

  const erc20 = useErc20State({ networkId, address })
  const saveErc20s = useSaveErc20s(networkId)

  const fetchAndUpdateState = useCallback(async (): Promise<void> => {
    if (!address || !networkId) {
      return
    }

    setIsLoading(true)

    const fetched = await _fetchErc20FromNetwork({ address, networkId, setError })
    if (fetched) {
      saveErc20s([fetched])
    }

    setError(undefined)
    setIsLoading(false)
  }, [address, networkId, saveErc20s])

  useEffect(() => {
    // Only try to fetch it if not on global state
    if (!erc20) {
      fetchAndUpdateState()
    }
  }, [erc20, fetchAndUpdateState])

  return { isLoading, error, value: erc20 }
}

export type UseMultipleErc20Params = { addresses: string[]; networkId?: Network }

/**
 * Fetches multiple erc20 token details for given network and addresses
 * More efficient method to fetch many tokens at once, and avoid unnecessary re-renders
 *
 * Tries to get it from globalState.
 * If not found, tries to get it from the network.
 * Saves to globalState if found.
 *`value` is an object with the `address` as key and it's value is either `null` when not found or the erc20
 * Returns `isLoading` to indicate whether fetching the value
 * Returns `error` with the error messages, if any.
 */
export function useMultipleErc20(
  params: UseMultipleErc20Params,
): Return<Record<string, UiError>, Record<string, SingleErc20State>> {
  const { addresses, networkId } = params

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Errors>({})

  const erc20s = useMultipleErc20sState({ networkId, addresses })
  const saveErc20s = useSaveErc20s(networkId)

  // check what on globalState has not been fetched yet
  const toFetch = useMemo(() => addresses.filter((address) => !erc20s[address]), [addresses, erc20s])
  // flow control
  const running = useRef({ networkId, isRunning: false })

  const updateErc20s = useCallback(async (): Promise<void> => {
    if (!networkId || toFetch.length === 0) {
      return
    }

    running.current = { networkId, isRunning: true }

    setIsLoading(true)
    setErrors({})

    const promises = toFetch.map(async (address) =>
      _fetchErc20FromNetwork({
        address,
        networkId,
        setError: (error) => setErrors((curr) => ({ ...curr, [address]: error })),
      }),
    )

    const fetched = await Promise.all(promises)

    // Save to global state newly fetched tokens that are not null
    saveErc20s(fetched.filter(Boolean) as TokenErc20[])

    setIsLoading(false)
    running.current = { networkId, isRunning: false }
  }, [networkId, saveErc20s, toFetch])

  useEffect(() => {
    // only trigger network query if not yet running or the network has changed
    if (!running.current.isRunning || running.current.networkId !== networkId) {
      updateErc20s()
    }
  }, [updateErc20s, saveErc20s, networkId])

  return { isLoading, error: errors, value: erc20s }
}
