import { getAddress } from 'viem'

import { CHAIN_INFO } from '@cowprotocol/common-const'
import {
  isBtcAddress,
  isBtcChain,
  isEvmAddress,
  isSolanaAddress,
  isSolanaChain,
  SupportedChainId,
  TargetChainId,
} from '@cowprotocol/cow-sdk'

import { t } from '@lingui/core/macro'

import { getExplorerOrderLink } from './explorer'
import { getSafeAbsoluteUrl } from './safeLink'

/**
 * Environment variable to override the block explorer URL.
 * Useful for local development with tools like Otterscan.
 */
const BLOCK_EXPLORER_URL_OVERRIDE = process.env.REACT_APP_BLOCK_EXPLORER_URL

/**
 * EVM only. Returns the checksummed EVM address if valid, otherwise false.
 *
 * Do not make this chain-aware: it has no `chainId` and ~23 call sites rely on the EVM contract
 * (recipient validation, quote params). For chain-agnostic checks use `isSupportedAddress` /
 * `getAddressKey` from `@cowprotocol/cow-sdk`.
 */
export function isAddress(value: string | undefined | null): string | false {
  if (!value) return false

  return checksumEvmAddress(value)
}

/**
 * Shortens an address for display, falling back to the original value when it cannot be shortened.
 *
 * Use it for values that are only *expected* to be addresses (backend payloads, user input): the
 * full 42-char address would break the UI layout, but `shortenAddress` throws on anything that
 * isn't a known address format, so the raw value is displayed instead.
 */
export function safeShortenAddress(address: string, chars?: number): string {
  try {
    return shortenAddress(address, chars)
  } catch {
    return address
  }
}

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address: string, chars = 4): string {
  if (isEvmAddress(address)) {
    const parsed = isAddress(address)
    if (!parsed) {
      throw Error(`Invalid 'address' parameter '${address}'.`)
    }
    return makeAddressShorter(parsed, chars)
  }

  if (isCaseSensitiveAddress(address)) {
    return makeAddressShorter(address, chars)
  }

  throw Error(`Invalid 'address' parameter '${address}'.`)
}

function checksumEvmAddress(value: string): string | false {
  const prefixed = value.startsWith('0x') ? value : `0x${value}`
  try {
    return getAddress(prefixed)
  } catch {
    return false
  }
}

function isCaseSensitiveAddress(address: string): boolean {
  return isBtcAddress(address) || isSolanaAddress(address)
}

function makeAddressShorter(address: string, chars = 4): string {
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`
}

const COW_ORDER_ID_LENGTH = 114 // 112 (56 bytes in hex) + 2 (it's prefixed with "0x")
const SOLANA_ORDER_ID_LENGTH = 66 // 64 (32 bytes in hex) + 2 (it's prefixed with "0x")

export type BlockExplorerLinkType =
  | 'transaction'
  | 'token'
  | 'address'
  | 'block'
  | 'token-transfer'
  | 'composable-order'
  | 'event'
  | 'contract'

export function formatOrderId(orderId: string): string {
  const has0x = orderId.match('0x')

  // 0x is at index 0 of orderId, shorten. Else return id as is
  return has0x?.index === 0 ? shortenOrderId(orderId) : orderId
}

// Get the right block explorer URL by chainId
export function getBlockExplorerUrl(
  chainId: TargetChainId,
  type: BlockExplorerLinkType,
  data: string,
  base?: string,
): string {
  return getEtherscanUrl(chainId, data, type, base)
}

export function getChainExplorerLinkTitle(chainId: SupportedChainId): string {
  const explorerTitle = CHAIN_INFO[chainId].explorerTitle

  return t`View on` + ` ${explorerTitle}`
}
export function getCoWExplorerLinkTitle(): string {
  return t`View on Explorer`
}

export function getEtherscanLink(chainId: SupportedChainId, type: BlockExplorerLinkType, data: string): string {
  if (isCowOrder(type, data, chainId)) {
    // Explorer for CoW orders:
    //    If a transaction has the size of the CoW orderId, then it's a meta-tx
    return getExplorerOrderLink(chainId, data)
  } else {
    return getEtherscanUrl(chainId, data, type)
  }
}

export function getEtherscanUrl(
  chainId: TargetChainId,
  data: string,
  type: BlockExplorerLinkType,
  base?: string,
): string {
  // Allow override via environment variable for local development (e.g., Otterscan)
  const basePath =
    getSafeAbsoluteUrl(BLOCK_EXPLORER_URL_OVERRIDE) ||
    getSafeAbsoluteUrl(base) ||
    getSafeAbsoluteUrl(CHAIN_INFO[chainId]?.explorer)

  if (!basePath) return ''

  if (isBtcChain(chainId)) return getBtcExplorerUrl(basePath, data, type)
  // a dedicated explorer URL builder must be added here before this fallback.
  if (isSolanaChain(chainId)) return getSolExplorerUrl(basePath, data, type)
  return getEvmExplorerUrl(basePath, data, type)
}

export function getExplorerLabel(chainId: SupportedChainId, type: BlockExplorerLinkType, data?: string): string {
  return isCowOrder(type, data, chainId) ? getCoWExplorerLinkTitle() : getChainExplorerLinkTitle(chainId)
}

/**
 * A CoW order id is told apart from a raw transaction hash by its length, which needs the chain to be
 * unambiguous: Solana order ids are 32 bytes, exactly the length of an EVM transaction hash. Callers that
 * pass no `chainId` keep the EVM rule, so an EVM transaction hash is never mistaken for an order.
 */
export function isCowOrder(type: BlockExplorerLinkType, data?: string, chainId?: TargetChainId): boolean {
  if (!data || type !== 'transaction') return false

  if (chainId !== undefined && isSolanaChain(chainId)) {
    return data.length === SOLANA_ORDER_ID_LENGTH
  }

  return data.length === COW_ORDER_ID_LENGTH
}

export function shortenOrderId(orderId: string): string {
  return orderId.slice(0, 6) + '...' + orderId.slice(orderId.length - 4)
}

function getBtcExplorerUrl(basePath: string, data: string, type: BlockExplorerLinkType): string {
  switch (type) {
    case 'transaction':
    case 'event':
      return `${basePath}/tx/${data}`
    case 'block':
      return `${basePath}/block/${data}`
    case 'address':
    case 'token-transfer':
    default:
      return `${basePath}/address/${data}`
    case 'token':
    case 'contract':
      return `${basePath}` // BTC has no token or contract page
  }
}

function getEvmExplorerUrl(basePath: string, data: string, type: BlockExplorerLinkType): string {
  switch (type) {
    case 'transaction':
      return `${basePath}/tx/${data}`
    case 'token':
      return `${basePath}/token/${data}`
    case 'block':
      return `${basePath}/block/${data}`
    case 'token-transfer':
      return `${basePath}/address/${data}#tokentxns`
    case 'event':
      return `${basePath}/tx/${data}#eventlog`
    case 'contract':
      return `${basePath}/address/${data}#code`
    case 'address':
    default:
      return `${basePath}/address/${data}`
  }
}

function getSolExplorerUrl(basePath: string, data: string, type: BlockExplorerLinkType): string {
  switch (type) {
    case 'transaction':
    case 'event':
      return `${basePath}/tx/${data}`
    case 'token':
    case 'token-transfer':
    case 'address':
    case 'contract':
    default:
      return `${basePath}/address/${data}`
    case 'block':
      return `${basePath}/block/${data}`
  }
}
