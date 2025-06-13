import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { TokenErc20 } from '@gnosis.pm/dex-js'
import { NATIVE_TOKEN_PER_NETWORK } from 'const'
import { getErc20Info } from 'services/helpers'
import { SingleErc20State, useMultipleErc20s as useMultipleErc20sState, useSaveErc20s } from 'state/erc20'
import { Errors, Network, UiError } from 'types'
import { isNativeToken, retry } from 'utils'

import { useTokenList } from './useTokenList'

import { erc20Api, web3 } from '../explorer/api'

async function _fetchErc20FromNetwork(params: {
  address: string
  networkId: number
  setError: (error: UiError) => void
}): Promise<SingleErc20State> {
  const { address, networkId, setError } = params

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

type Return<E, V> = { isLoading: boolean; error?: E; value: V }

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
// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
export function useMultipleErc20(
  params: UseMultipleErc20Params
): Return<Record<string, UiError>, Record<string, SingleErc20State>> {
  const { addresses, networkId } = params

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const { isLoading: isTokenListLoading, data: tokenListTokens } = useTokenList(networkId)

  const erc20s = useMultipleErc20sState({ networkId, addresses })
  const saveErc20s = useSaveErc20s(networkId)

  const fromTokenList = useMemo(
    () =>
      addresses.reduce((acc, address) => {
        const token = tokenListTokens[address.toLowerCase()]
        if (token) {
          acc[address] = token
        }
        return acc
      }, {}),
    [addresses, tokenListTokens]
  )

  // If native token is in the list of tokens to be fetched, memoize it here
  const nativeState = useMemo(
    () =>
      addresses.reduce<Record<string, TokenErc20> | undefined>((native, address) => {
        if (native) return native
        if (isNativeToken(address)) {
          // Default to mainnet (ETH) when the network isn't configured
          const nativeToken = NATIVE_TOKEN_PER_NETWORK[networkId || Network.MAINNET]
          // Overwrite native address because otherwise it won't match the case
          // Causing the caller to never know we got the token it was looking for
          // return { ...nativeToken, address }
          return { [address.toLowerCase()]: nativeToken }
        }
        return undefined
      }, undefined) || {},
    [addresses, networkId]
  )

  // check what on globalState has not been fetched yet
  const toFetch = useMemo(
    () =>
      isTokenListLoading
        ? []
        : addresses.filter(
            (address) =>
              // Do not try to fetch the ones we already loaded
              !erc20s[address] &&
              // Do not try to fetch the ones in a token list
              !fromTokenList[address] &&
              // Do not try to fetch native
              !isNativeToken(address)
          ),
    [addresses, erc20s, fromTokenList, isTokenListLoading]
  )
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
      })
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

  return useMemo(
    () => ({
      isLoading: isTokenListLoading || isLoading,
      error: errors,
      value: { ...erc20s, ...fromTokenList, ...nativeState },
    }),
    [isTokenListLoading, isLoading, errors, erc20s, fromTokenList, nativeState]
  )
}
