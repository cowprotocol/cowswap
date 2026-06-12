import { RPC_URLS } from '@cowprotocol/common-const'
import {
  contenthashToUri,
  isAddress,
  parseENSAddress,
  resolveENSContentHash,
  uriToHttp,
} from '@cowprotocol/common-utils'
import { getAddressKey, isSolanaAddress, SupportedChainId } from '@cowprotocol/cow-sdk'
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

/**
 * Sanitize a token list, accepting both EVM and non-EVM (Solana) tokens.
 *
 * - EVM tokens: address is checksummed via `isAddress`; rejected if not valid hex.
 * - Solana tokens: address kept as-is (base58 is case-sensitive); accepted if it matches
 *   `isSolanaAddress`. Otherwise the token is dropped.
 *
 * If the resulting list contains any non-EVM tokens, we bypass the Uniswap `validateTokenList`
 * schema (which only knows EVM addresses) and fall back to a shape-only sanity check.
 */
async function sanitizeList(list: TokenList): Promise<TokenList> {
  let hasNonEvmTokens = false

  const tokens = list.tokens.reduce<TokenList['tokens']>((acc, token) => {
    // `getAddressKey` lowercases EVM hex addresses and leaves non-EVM (base58) addresses
    // untouched — exactly the normalization `isAddress` (case-insensitive on EVM hex) wants.
    const checksummed = isAddress(getAddressKey(token.address))
    if (checksummed) {
      acc.push({ ...token, address: checksummed })
      return acc
    }
    if (isSolanaAddress(token.address)) {
      hasNonEvmTokens = true
      acc.push(token)
    }
    return acc
  }, [])

  const cleanedList = { ...list, tokens }

  if (hasNonEvmTokens) {
    // Uniswap's `validateTokenList` schema rejects non-EVM addresses by construction.
    if (!isValidTokenList(cleanedList)) {
      throw new Error('Invalid token list format')
    }
    return cleanedList
  }

  return validateTokenList(cleanedList)
}

/** Lightweight shape check used for token lists that contain non-EVM (Solana) addresses,
 *  which the Uniswap JSON-schema validator can't parse. */
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
