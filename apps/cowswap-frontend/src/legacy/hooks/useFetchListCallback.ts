import { useCallback } from 'react'

import { MAINNET_PROVIDER } from '@cowprotocol/common-const'
import { resolveENSContentHash } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'
import { TokenList } from '@uniswap/token-lists'

import { nanoid } from '@reduxjs/toolkit'

import { useAppDispatch } from 'legacy/state/hooks'
import { fetchTokenList } from 'legacy/state/lists/actions'

import getTokenList from 'lib/hooks/useTokenList/fetchTokenList'

const TOKENS_LISTS_ENS_HASHES: { [key: string]: string } = {
  'tokenlist.aave.eth': '0xe301017012204aeb1d95ad5624a5299aa40dab01016b8a9c8401515ec063e9663d80f3776366',
  'defi.cmc.eth': '0xe301017012201acd1250f6110108aaa17ed1ae463334655067138bc3270bbb44c71235cf6ffa',
  'stablecoin.cmc.eth': '0xe30101701220f4b10385da995ae2d0925d328c7d82f21279000d10b4dcd8d409c0a9ef0c6cc1',
  'synths.snx.eth': '0xe30101701220134dda0aa35ea0289bc5688fe82b3e2d153b8ffbfb150984666a80b7b0b8412e',
  'wrapped.tokensoft.eth': '0xe30101701220a77c3f3999021e5a6e2551e36424e5270450ae259a9b1edde1ade5cd7c70ffa3',
  't2crtokens.eth': '0xe3010170122062dd98ddd1b57a4e34c602b0fe40746cf71d427d24ab5689082480f9e8b97a12',
}

export function useFetchListCallback(): (listUrl: string, sendDispatch?: boolean) => Promise<TokenList> {
  const dispatch = useAppDispatch()
  const { chainId } = useWalletInfo()

  // note: prevent dispatch if using for list search or unsupported list
  return useCallback(
    async (listUrl: string, sendDispatch = true) => {
      const requestId = nanoid()
      sendDispatch && dispatch(fetchTokenList.pending({ requestId, url: listUrl, chainId }))
      return getTokenList(listUrl, (ensName: string) => {
        const cachedHash = TOKENS_LISTS_ENS_HASHES[ensName]

        return cachedHash ? Promise.resolve(cachedHash) : resolveENSContentHash(ensName, MAINNET_PROVIDER)
      })
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
