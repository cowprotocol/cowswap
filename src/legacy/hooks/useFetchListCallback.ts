import { useCallback } from 'react'

import { TokenList } from '@uniswap/token-lists'

import { nanoid } from '@reduxjs/toolkit'

import { MAINNET_PROVIDER } from 'legacy/constants/networks'
import { useAppDispatch } from 'legacy/state/hooks'
import { fetchTokenList } from 'legacy/state/lists/actions'

import { useWalletInfo } from 'modules/wallet'

import getTokenList from 'lib/hooks/useTokenList/fetchTokenList'
import resolveENSContentHash from 'lib/utils/resolveENSContentHash'

export function useFetchListCallback(): (listUrl: string, sendDispatch?: boolean) => Promise<TokenList> {
  const dispatch = useAppDispatch()
  const { chainId } = useWalletInfo()

  // note: prevent dispatch if using for list search or unsupported list
  return useCallback(
    async (listUrl: string, sendDispatch = true) => {
      const requestId = nanoid()
      sendDispatch && dispatch(fetchTokenList.pending({ requestId, url: listUrl, chainId }))
      return getTokenList(listUrl, (ensName: string) => resolveENSContentHash(ensName, MAINNET_PROVIDER))
        .then((tokenList) => {
          // Mod: add chainId
          sendDispatch && dispatch(fetchTokenList.fulfilled({ url: listUrl, tokenList, requestId, chainId }))
          return tokenList
        })
        .catch((error) => {
          console.debug(`Failed to get list at url ${listUrl}`, error)
          sendDispatch &&
            dispatch(fetchTokenList.rejected({ url: listUrl, requestId, errorMessage: error.message, chainId }))
          throw error
        })
    },
    [chainId, dispatch]
  )
}
