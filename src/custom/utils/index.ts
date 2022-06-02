import { Percent } from '@uniswap/sdk-core'
import JSBI from 'jsbi'
import { ORDER_ID_SHORT_LENGTH } from '../constants'
import { getExplorerOrderLink } from './explorer'
import { SupportedChainId as ChainId } from 'constants/chains'

const GP_ORDER_ID_LENGTH = 114 // 112 (56 bytes in hex) + 2 (it's prefixed with "0x")

export {
  isAddress,
  shortenAddress,
  getSigner,
  getProviderOrSigner,
  getContract,
  escapeRegExp,
  isTokenOnList,
  formattedFeeAmount,
} from '@src/utils'

const ETHERSCAN_PREFIXES: { [chainId in ChainId]: string } = {
  1: '',
  // 3: 'ropsten.',
  4: 'rinkeby.',
  // 5: 'goerli.',
  // 42: 'kovan.',
  100: 'xdai.',
}

export type BlockExplorerLinkType = 'transaction' | 'token' | 'address' | 'block' | 'token-transfer'

function getEtherscanUrl(chainId: ChainId, data: string, type: BlockExplorerLinkType): string {
  const prefix = `https://${ETHERSCAN_PREFIXES[chainId] || ETHERSCAN_PREFIXES[1]}etherscan.io`

  switch (type) {
    case 'transaction': {
      return `${prefix}/tx/${data}`
    }
    case 'token': {
      return `${prefix}/token/${data}`
    }
    case 'block': {
      return `${prefix}/block/${data}`
    }
    case 'token-transfer': {
      return `${prefix}/address/${data}#tokentxns`
    }
    case 'address':
    default: {
      return `${prefix}/address/${data}`
    }
  }
}

function getBlockscoutUrlPrefix(chainId: ChainId): string {
  switch (chainId) {
    case ChainId.XDAI:
      return 'poa/xdai'

    default:
      return ''
  }
}

function getBlockscoutUrlSuffix(type: BlockExplorerLinkType, data: string): string {
  switch (type) {
    case 'transaction':
      return `tx/${data}`
    case 'block':
      return `blocks/${data}/transactions`
    case 'address':
      return `address/${data}/transactions`
    case 'token-transfer':
      return `address/${data}/token-transfers`
    case 'token':
      return `tokens/${data}/token-transfers`
  }
}

function getBlockscoutUrl(chainId: ChainId, data: string, type: BlockExplorerLinkType): string {
  return `https://blockscout.com/${getBlockscoutUrlPrefix(chainId)}/${getBlockscoutUrlSuffix(type, data)}`
}

// Get the right block explorer URL by chainId
export function getBlockExplorerUrl(chainId: ChainId, data: string, type: BlockExplorerLinkType): string {
  switch (chainId) {
    // Check if chain is xDAI to use Blockscout
    case ChainId.XDAI:
      return getBlockscoutUrl(chainId, data, type)
    // Otherwise always use Etherscan for other chains
    default:
      return getEtherscanUrl(chainId, data, type)
  }
}

export function isGpOrder(data: string, type: BlockExplorerLinkType) {
  return type === 'transaction' && data.length === GP_ORDER_ID_LENGTH
}

export function getEtherscanLink(chainId: ChainId, data: string, type: BlockExplorerLinkType): string {
  if (isGpOrder(data, type)) {
    // Explorer for GP orders:
    //    If a transaction has the size of the GP orderId, then it's a meta-tx
    return getExplorerOrderLink(chainId, data)
  } else if (chainId === ChainId.XDAI) {
    // Blockscout in xDAI
    return getBlockscoutUrl(chainId, data, type)
  } else {
    // Etherscan in xDAI
    return getEtherscanUrl(chainId, data, type)
  }
}

export function getExplorerLabel(chainId: ChainId, data: string, type: BlockExplorerLinkType): string {
  if (isGpOrder(data, type)) {
    return 'View on Explorer'
  } else if (chainId === ChainId.XDAI) {
    return 'View on Blockscout'
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
