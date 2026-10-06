import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { getAddressKey, isSolanaChain } from '@cowprotocol/cow-sdk'

import { TokenErc20 } from '@gnosis.pm/dex-js'
import { NATIVE_TOKEN_PER_NETWORK } from 'const'
import { getErc20Info } from 'services/helpers'
import { SingleErc20State, useMultipleErc20s as useMultipleErc20sState, useSaveErc20s } from 'state/erc20'
import { Errors, Network, UiError } from 'types'
import { isNativeToken, retry } from 'utils'

import { useTokenList } from './useTokenList'

import { getSplTokenInfo } from '../api/solanaOrderbook/getSplTokenInfo'
import { erc20Api, web3 } from '../explorer/api'

export type UseMultipleErc20Params = { addresses: string[]; networkId?: Network }

type Return<E, V> = { isLoading: boolean; error?: E; value: V }

export function useMultipleErc20(
  params: UseMultipleErc20Params,
): Return<Record<string, UiError>, Record<string, SingleErc20State>> {
  const { addresses, networkId } = params

  const [isFetching, setIsFetching] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const { isLoading: isTokenListLoading, data: tokenListTokens } = useTokenList(networkId)
  // A token that resolves to nothing is never stored, so without this it would be requested again on
  // every render and keep the caller waiting forever.
  const [attempted, setAttempted] = useState<Set<string>>(new Set())

  const erc20s = useMultipleErc20sState({ networkId, addresses })
  const saveErc20s = useSaveErc20s(networkId)

  const fromTokenList = useMemo(
    () =>
      addresses.reduce((acc, address) => {
        const token = tokenListTokens[getAddressKey(address)]
        if (token) {
          acc[address] = token
        }
        return acc
      }, {}),
    [addresses, tokenListTokens],
  )

  // If native token is in the list of tokens to be fetched, memoize it here
  const nativeState = useMemo(() => getNativeState(addresses, networkId), [addresses, networkId])

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
              !isNativeToken(address) &&
              // Do not try again the ones the network had nothing for
              !attempted.has(address),
          ),
    [addresses, attempted, erc20s, fromTokenList, isTokenListLoading],
  )

  // Reported synchronously rather than from `isFetching` alone: the request starts in an effect, so
  // a caller reading the state in that same commit would otherwise see "done" before it began and
  // render the orders it has, leaving whatever needed the network permanently unresolved.
  const isLoading = isTokenListLoading || isFetching || toFetch.length > 0
  // flow control
  const running = useRef({ networkId, isRunning: false })

  const updateErc20s = useCallback(async (): Promise<void> => {
    if (!networkId || toFetch.length === 0) {
      return
    }

    running.current = { networkId, isRunning: true }

    setIsFetching(true)
    setErrors({})

    const promises = toFetch.map(async (address) =>
      _fetchErc20FromNetwork({
        address,
        networkId,
        setError: (error) => setErrors((curr) => ({ ...curr, [address]: error })),
      }),
    )

    const fetched = await Promise.all(promises)

    setAttempted((current) => new Set([...current, ...toFetch]))
    // Save to global state newly fetched tokens that are not null
    saveErc20s(fetched.filter(Boolean) as TokenErc20[])

    setIsFetching(false)
    running.current = { networkId, isRunning: false }
  }, [networkId, saveErc20s, toFetch])

  useEffect(() => {
    setAttempted(new Set())
  }, [networkId])

  useEffect(() => {
    // only trigger network query if not yet running or the network has changed
    if (!running.current.isRunning || running.current.networkId !== networkId) {
      updateErc20s()
    }
  }, [updateErc20s, saveErc20s, networkId])

  return useMemo(
    () => ({
      isLoading,
      error: errors,
      value: { ...erc20s, ...fromTokenList, ...nativeState },
    }),
    [isLoading, errors, erc20s, fromTokenList, nativeState],
  )
}

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

async function _fetchErc20FromNetwork(params: {
  address: string
  networkId: number
  setError: (error: UiError) => void
}): Promise<SingleErc20State> {
  const { address, networkId, setError } = params
  // An SPL mint is not a contract to read `symbol`/`decimals` off, so it needs its own lookup.
  const fetchToken = isSolanaChain(networkId)
    ? () => getSplTokenInfo(address)
    : () => getErc20Info({ tokenAddress: address, networkId, web3, erc20Api })

  try {
    return await retry(fetchToken)
  } catch (e) {
    const msg = `Failed to fetch token details for ${address} on network ${networkId}`
    console.error(msg, e)
    setError({ message: msg, type: 'error' })
    // When failed, return null for given token
    return null
  }
}

function getNativeState(addresses: string[], networkId?: Network): Record<string, TokenErc20> {
  return (
    addresses.reduce<Record<string, TokenErc20> | undefined>((native, address) => {
      if (native) return native
      if (isNativeToken(address)) {
        // Default to mainnet (ETH) when the network isn't configured
        const nativeToken = NATIVE_TOKEN_PER_NETWORK[networkId || Network.MAINNET]
        // Overwrite native address because otherwise it won't match the case
        // Causing the caller to never know we got the token it was looking for
        return { [getAddressKey(address)]: nativeToken }
      }
      return undefined
    }, undefined) || {}
  )
}
