import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { getAddress } from '@ethersproject/address'
import { AddressZero } from '@ethersproject/constants'
import { Contract } from '@ethersproject/contracts'
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers'
import { Percent, Token } from '@uniswap/sdk-core'
import { FeeAmount } from '@uniswap/v3-sdk'

import JSBI from 'jsbi'

import { ORDER_ID_SHORT_LENGTH } from 'legacy/constants'
import { getExplorerOrderLink } from 'legacy/utils/explorer'

import { ChainTokenMap } from 'lib/hooks/useTokenList/utils'

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: any): string | false {
  try {
    return getAddress(value)
  } catch {
    return false
  }
}

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address: string, chars = 4): string {
  const parsed = isAddress(address)
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`
}

// account is not optional
export function getSigner(provider: JsonRpcProvider, account: string): JsonRpcSigner {
  return provider.getSigner(account).connectUnchecked()
}

// account is optional
export function getProviderOrSigner(provider: JsonRpcProvider, account?: string): JsonRpcProvider | JsonRpcSigner {
  return account ? getSigner(provider, account) : provider
}

// account is optional
export function getContract(address: string, ABI: any, provider: JsonRpcProvider, account?: string): Contract {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }

  return new Contract(address, ABI, getProviderOrSigner(provider, account) as any)
}

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

export function isTokenOnList(chainTokenMap: ChainTokenMap, token?: Token): boolean {
  return Boolean(token?.isToken && chainTokenMap[token.chainId]?.[token.address])
}

export function formattedFeeAmount(feeAmount: FeeAmount): number {
  return feeAmount / 10000
}

const COW_ORDER_ID_LENGTH = 114 // 112 (56 bytes in hex) + 2 (it's prefixed with "0x")

const ETHERSCAN_URLS: { [chainId in ChainId]: string } = {
  1: 'etherscan.io',
  // 3: 'ropsten.etherscan.io',
  // 4: 'rinkeby.etherscan.io',
  5: 'goerli.etherscan.io',
  // 42: 'kovan.etherscan.io',
  100: 'gnosisscan.io',
}

export type BlockExplorerLinkType =
  | 'transaction'
  | 'token'
  | 'address'
  | 'block'
  | 'token-transfer'
  | 'cow-explorer-home'
  | 'composable-order'

function getEtherscanUrl(chainId: ChainId, data: string, type: BlockExplorerLinkType): string {
  const url = ETHERSCAN_URLS[chainId] || ETHERSCAN_URLS[1]

  const basePath = `https://${url}`

  switch (type) {
    case 'transaction': {
      return `${basePath}/tx/${data}`
    }
    case 'token': {
      return `${basePath}/token/${data}`
    }
    case 'block': {
      return `${basePath}/block/${data}`
    }
    case 'token-transfer': {
      return `${basePath}/address/${data}#tokentxns`
    }
    case 'address':
    default: {
      return `${basePath}/address/${data}`
    }
  }
}

// Get the right block explorer URL by chainId
export function getBlockExplorerUrl(chainId: ChainId, type: BlockExplorerLinkType, data: string): string {
  return getEtherscanUrl(chainId, data, type)
}

export function isCowOrder(type: BlockExplorerLinkType, data?: string) {
  if (!data) return false

  return type === 'transaction' && data.length === COW_ORDER_ID_LENGTH
}

export function getEtherscanLink(chainId: ChainId, type: BlockExplorerLinkType, data: string): string {
  if (isCowOrder(type, data)) {
    // Explorer for CoW orders:
    //    If a transaction has the size of the CoW orderId, then it's a meta-tx
    return getExplorerOrderLink(chainId, data)
  } else {
    return getEtherscanUrl(chainId, data, type)
  }
}

export function getExplorerLabel(chainId: ChainId, type: BlockExplorerLinkType, data?: string): string {
  if (isCowOrder(type, data) || type === 'cow-explorer-home') {
    return 'View on Explorer'
  } else if (chainId === ChainId.GNOSIS_CHAIN) {
    return 'View on Gnosisscan'
  } else {
    return 'View on Etherscan'
  }
}

// Shortens OrderID (or any string really) removing initial 2 characters e.g 0x
// and cutting string at 'chars' length, default = 8
export function shortenOrderId(orderId: string, start = 0, chars = ORDER_ID_SHORT_LENGTH): string {
  return orderId.substring(start, chars + start)
}

export function formatOrderId(orderId: string): string {
  const has0x = orderId.match('0x')

  // 0x is at index 0 of orderId, shorten. Else return id as is
  return has0x?.index === 0 ? shortenOrderId(orderId, 2, orderId.length) : orderId
}

// converts a basis points value to a sdk percent
export function basisPointsToPercent(num: number): Percent {
  return new Percent(JSBI.BigInt(num), JSBI.BigInt(10000))
}

export function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined
}
