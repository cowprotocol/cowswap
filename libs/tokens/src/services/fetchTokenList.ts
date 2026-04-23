import { RPC_URLS } from '@cowprotocol/common-const'
import {
  contenthashToUri,
  isAddress,
  parseENSAddress,
  resolveENSContentHash,
  uriToHttp,
} from '@cowprotocol/common-utils'
import { SOL_ADDRESS_PATTERN, SupportedChainId } from '@cowprotocol/cow-sdk'
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
  sanitizer: (list: unknown) => Promise<TokenList>,
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

function isValidNonEvmAddress(address: string): boolean {
  return SOL_ADDRESS_PATTERN.test(address)
}

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

/**
 * Like sanitizeList, but for non-EVM chains (e.g. Solana, BTC).
 * Skips EVM address checksum — validates list shape via typeguard and filters tokens
 * whose addresses don't match any known non-EVM address pattern.
 */
async function sanitizeAdditionalChainList(value: unknown): Promise<TokenList> {
  if (!isValidTokenList(value)) {
    throw new Error('Invalid token list format')
  }

  const tokens = value.tokens.filter((token) => isValidNonEvmAddress(token.address))

  return { ...value, tokens }
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
