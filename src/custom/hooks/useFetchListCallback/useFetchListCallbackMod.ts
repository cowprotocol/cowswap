import { nanoid } from '@reduxjs/toolkit'
import { ChainId } from '@uniswap/sdk'
import { TokenList } from '@uniswap/token-lists'
import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { getNetworkLibrary, NETWORK_CHAIN_ID } from 'connectors'
import { AppDispatch } from '../../state'
import { fetchTokenList } from 'state/lists/actions'
import getTokenList from 'utils/getTokenList'
import resolveENSContentHash from 'utils/resolveENSContentHash'
import { useActiveWeb3React } from 'hooks'

export function useFetchListCallback(): (listUrl: string, sendDispatch?: boolean) => Promise<TokenList> {
  const { chainId, library } = useActiveWeb3React()
  const dispatch = useDispatch<AppDispatch>()

  const ensResolver = useCallback(
    (ensName: string) => {
      if (!library || chainId !== ChainId.MAINNET) {
        if (NETWORK_CHAIN_ID === ChainId.MAINNET) {
          const networkLibrary = getNetworkLibrary()
          if (networkLibrary) {
            return resolveENSContentHash(ensName, networkLibrary)
          }
        }
        throw new Error('Could not construct mainnet ENS resolver')
      }
      return resolveENSContentHash(ensName, library)
    },
    [chainId, library]
  )

  // note: prevent dispatch if using for list search or unsupported list
  return useCallback(
    async (listUrl: string, sendDispatch = true) => {
      const requestId = nanoid()
      // Mod: add chainId
      sendDispatch && dispatch(fetchTokenList.pending({ requestId, url: listUrl, chainId }))
      return getTokenList(listUrl, ensResolver)
        .then(tokenList => {
          // Mod: add chainId
          sendDispatch && dispatch(fetchTokenList.fulfilled({ url: listUrl, tokenList, requestId, chainId }))
          return tokenList
        })
        .catch(error => {
          console.debug(`Failed to get list at url ${listUrl}`, error)
          sendDispatch &&
            // Mod: add chainId
            dispatch(fetchTokenList.rejected({ url: listUrl, requestId, errorMessage: error.message, chainId }))
          throw error
        })
    },
    // Mod: add chainId
    // [dispatch, ensResolver]
    [chainId, dispatch, ensResolver]
  )
}
