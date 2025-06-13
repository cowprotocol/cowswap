import { CHAIN_INFO } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { getAddress } from '@ethersproject/address'
import { AddressZero } from '@ethersproject/constants'
import { Contract, ContractInterface } from '@ethersproject/contracts'
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers'

import { getExplorerOrderLink } from './explorer'

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: string | undefined | null): string | false {
  try {
    return getAddress(value as never)
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
export function getContract(
  address: string,
  ABI: ContractInterface,
  provider: JsonRpcProvider,
  account?: string
): Contract {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }

  return new Contract(address, ABI, getProviderOrSigner(provider, account))
}

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

const COW_ORDER_ID_LENGTH = 114 // 112 (56 bytes in hex) + 2 (it's prefixed with "0x")

export type BlockExplorerLinkType =
  | 'transaction'
  | 'token'
  | 'address'
  | 'block'
  | 'token-transfer'
  | 'composable-order'
  | 'event'
  | 'contract'

function getEtherscanUrl(chainId: SupportedChainId, data: string, type: BlockExplorerLinkType): string {
  const basePath = CHAIN_INFO[chainId].explorer

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

// Get the right block explorer URL by chainId
export function getBlockExplorerUrl(chainId: SupportedChainId, type: BlockExplorerLinkType, data: string): string {
  return getEtherscanUrl(chainId, data, type)
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function isCowOrder(type: BlockExplorerLinkType, data?: string) {
  if (!data) return false

  return type === 'transaction' && data.length === COW_ORDER_ID_LENGTH
}

export function getEtherscanLink(chainId: SupportedChainId, type: BlockExplorerLinkType, data: string): string {
  if (isCowOrder(type, data)) {
    // Explorer for CoW orders:
    //    If a transaction has the size of the CoW orderId, then it's a meta-tx
    return getExplorerOrderLink(chainId, data)
  } else {
    return getEtherscanUrl(chainId, data, type)
  }
}

export function getExplorerLabel(chainId: SupportedChainId, type: BlockExplorerLinkType, data?: string): string {
  if (isCowOrder(type, data)) {
    return 'View on Explorer'
  }

  return `View on ${CHAIN_INFO[chainId].explorerTitle}`
}

export function shortenOrderId(orderId: string): string {
  return orderId.slice(0, 6) + '...' + orderId.slice(orderId.length - 4)
}

export function formatOrderId(orderId: string): string {
  const has0x = orderId.match('0x')

  // 0x is at index 0 of orderId, shorten. Else return id as is
  return has0x?.index === 0 ? shortenOrderId(orderId) : orderId
}
