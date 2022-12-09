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

const ETHERSCAN_URLS: { [chainId in ChainId]: string } = {
  1: 'etherscan.io',
  // 3: 'ropsten.etherscan.io',
  // 4: 'rinkeby.etherscan.io',
  5: 'goerli.etherscan.io',
  // 42: 'kovan.etherscan.io',
  100: 'gnosisscan.io',
}

export type BlockExplorerLinkType = 'transaction' | 'token' | 'address' | 'block' | 'token-transfer'

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
export function getBlockExplorerUrl(chainId: ChainId, data: string, type: BlockExplorerLinkType): string {
  return getEtherscanUrl(chainId, data, type)
}

export function isGpOrder(data: string, type: BlockExplorerLinkType) {
  return type === 'transaction' && data.length === GP_ORDER_ID_LENGTH
}

export function getEtherscanLink(chainId: ChainId, data: string, type: BlockExplorerLinkType): string {
  if (isGpOrder(data, type)) {
    // Explorer for GP orders:
    //    If a transaction has the size of the GP orderId, then it's a meta-tx
    return getExplorerOrderLink(chainId, data)
  } else {
    return getEtherscanUrl(chainId, data, type)
  }
}

export function getExplorerLabel(chainId: ChainId, data: string, type: BlockExplorerLinkType): string {
  if (isGpOrder(data, type)) {
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
