import { RPC_URLS } from '@cowprotocol/common-const'
import {
  contenthashToUri,
  isAddress,
  parseENSAddress,
  resolveENSContentHash,
  uriToHttp,
} from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { TokenList } from '@uniswap/token-lists'

import { createConfig, http } from 'wagmi'
import { mainnet } from 'wagmi/chains'

import { ListSourceConfig, ListState } from '../types'
import { validateTokenList } from '../utils/validateTokenList'

const MAINNET_CONFIG = createConfig({
  chains: [mainnet],
  transports: { [mainnet.id]: http(RPC_URLS[SupportedChainId.MAINNET]) },
})

/**
 * Refactored version of apps/cowswap-frontend/src/lib/hooks/useTokenList/fetchTokenList.ts
 */
export function fetchTokenList(list: ListSourceConfig): Promise<ListState> {
  const isEnsSource = parseENSAddress(list.source)
  return isEnsSource ? fetchTokenListByEnsName(list) : fetchTokenListByUrl(list)
}

async function fetchTokenListByUrl(list: ListSourceConfig): Promise<ListState> {
  return _fetchTokenList(list.source, [list.source], sanitizeList).then((result) => {
    return listStateFromSourceConfig(result, list)
  })
}

async function fetchTokenListByEnsName(list: ListSourceConfig): Promise<ListState> {
  const contentHashUri = await resolveENSContentHash(list.source, MAINNET_CONFIG)
  const translatedUri = contenthashToUri(contentHashUri)
  const urls = uriToHttp(translatedUri)

  return _fetchTokenList(list.source, urls, sanitizeList).then((result) => {
    return listStateFromSourceConfig(result, list)
  })
}

async function _fetchTokenList(
  source: string,
  urls: string[],
  sanitizer: (list: TokenList) => Promise<TokenList>,
): Promise<ListState> {
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i]
    const isLast = i === urls.length - 1

    let response

    try {
      response = await fetch(url, { credentials: 'omit' })
    } catch (error) {
      const message = `failed to fetch list: ${url}`

      console.debug(message, error)
      if (isLast) throw new Error(message)

      continue
    }

    if (!response.ok) {
      const message = `failed to fetch list: ${url}`

      console.debug(message, response.statusText)
      if (isLast) throw new Error(message)

      continue
    }

    try {
      const json = await response.json()

      return {
        source,
        list: await sanitizer(json),
      }
    } catch (e) {
      const message = `failed to process list ${url}`
      console.debug(message, e)

      if (isLast) throw new Error(message)

      continue
    }
  }

  throw new Error('Unrecognized list URL protocol.')
}

function listStateFromSourceConfig(result: ListState, list: ListSourceConfig): ListState {
  return {
    ...result,
    priority: list.priority,
    source: list.source,
    lpTokenProvider: list.lpTokenProvider,
  }
}

async function sanitizeList(list: TokenList): Promise<TokenList> {
  // Remove tokens from the list that don't have valid addresses
  const tokens = list.tokens.reduce<TokenList['tokens']>((acc, token) => {
    const checksummed = isAddress(token.address.toLowerCase())
    if (!checksummed) return acc
    acc.push({ ...token, address: checksummed })
    return acc
  }, [])

  const cleanedList = { ...list, tokens }

  // Validate the list
  return validateTokenList(cleanedList)
}

/**
 * Like sanitizeList, but skips EVM address validation.
 * Used for additional target chains (non-EVM, e.g. Solana) where addresses are not checksummed hex.
 */
async function sanitizeAdditionalChainList(list: TokenList): Promise<TokenList> {
  return validateTokenList(list)
}

/**
 * Fetches a token list for an additional target chain (non-EVM, e.g. Solana).
 * Unlike fetchTokenList, this skips EVM address checksum validation.
 */
export function fetchAdditionalChainTokenList(list: ListSourceConfig): Promise<ListState> {
  const isEnsSource = parseENSAddress(list.source)
  return isEnsSource ? fetchAdditionalChainTokenListByEnsName(list) : fetchAdditionalChainTokenListByUrl(list)
}

async function fetchAdditionalChainTokenListByUrl(list: ListSourceConfig): Promise<ListState> {
  return _fetchTokenList(list.source, [list.source], sanitizeAdditionalChainList).then((result) => {
    return listStateFromSourceConfig(result, list)
  })
}

async function fetchAdditionalChainTokenListByEnsName(list: ListSourceConfig): Promise<ListState> {
  const contentHashUri = await resolveENSContentHash(list.source, MAINNET_CONFIG)
  const translatedUri = contenthashToUri(contentHashUri)
  const urls = uriToHttp(translatedUri)

  return _fetchTokenList(list.source, urls, sanitizeAdditionalChainList).then((result) => {
    return listStateFromSourceConfig(result, list)
  })
}
