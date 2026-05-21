import { createConfig, http } from 'wagmi'
import { mainnet } from 'wagmi/chains'

import { RPC_URLS } from '@cowprotocol/common-const'
import {
  contenthashToUri,
  isAddress,
  parseENSAddress,
  resolveENSContentHash,
  uriToHttp,
} from '@cowprotocol/common-utils'
import { isSolanaAddress, SupportedChainId } from '@cowprotocol/cow-sdk'

import { TokenList } from '@uniswap/token-lists'

import { ListSourceConfig, ListState } from '../types'
import { validateTokenList } from '../utils/validateTokenList'

const MAINNET_CONFIG = createConfig({
  chains: [mainnet],
  transports: { [mainnet.id]: http(RPC_URLS[SupportedChainId.MAINNET]) },
})

/**
 * Fetches a token list for an additional target chain (non-EVM, e.g. Solana).
 * Unlike fetchTokenList, this skips EVM address checksum validation.
 * ENS resolution is not supported — non-EVM chains always use direct URLs.
 */
export function fetchAdditionalChainTokenList(list: ListSourceConfig): Promise<ListState> {
  return _fetchTokenList(list.source, [list.source], sanitizeAdditionalChainList).then((result) => {
    return listStateFromSourceConfig(result, list)
  })
}

/**
 * Refactored version of apps/cowswap-frontend/src/lib/hooks/useTokenList/fetchTokenList.ts
 */
export function fetchTokenList(list: ListSourceConfig): Promise<ListState> {
  const isEnsSource = parseENSAddress(list.source)
  return isEnsSource ? fetchTokenListByEnsName(list) : fetchTokenListByUrl(list)
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

async function fetchTokenListByEnsName(list: ListSourceConfig): Promise<ListState> {
  const contentHashUri = await resolveENSContentHash(list.source, MAINNET_CONFIG)
  const translatedUri = contenthashToUri(contentHashUri)
  const urls = uriToHttp(translatedUri)

  return _fetchTokenList(list.source, urls, sanitizeList).then((result) => {
    return listStateFromSourceConfig(result, list)
  })
}

async function fetchTokenListByUrl(list: ListSourceConfig): Promise<ListState> {
  return _fetchTokenList(list.source, [list.source], sanitizeList).then((result) => {
    return listStateFromSourceConfig(result, list)
  })
}

// we can't use uniswap scheme to validate non-evm lists due to address difference
function isValidTokenList(value: unknown): value is TokenList {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    typeof v['name'] === 'string' &&
    typeof v['version'] === 'object' &&
    v['version'] !== null &&
    Array.isArray(v['tokens'])
  )
}

function listStateFromSourceConfig(result: ListState, list: ListSourceConfig): ListState {
  return {
    ...result,
    priority: list.priority,
    source: list.source,
    lpTokenProvider: list.lpTokenProvider,
  }
}

/**
 * Like sanitizeList, but for non-EVM chains (e.g. Solana, BTC).
 * Validates list shape at runtime (response.json() is any), then filters tokens
 * whose addresses don't match any known non-EVM address pattern.
 */
async function sanitizeAdditionalChainList(list: TokenList): Promise<TokenList> {
  if (!isValidTokenList(list)) {
    throw new Error('Invalid token list format')
  }

  const tokens = list.tokens.filter((token) => isSolanaAddress(token.address))
  return { ...list, tokens }
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
