import { ChainId } from '@uniswap/sdk'
import { getExplorerOrderLink } from './explorer'

const GP_ORDER_ID_LENGTH = 114 // 112 (56 bytes in hex) + 2 (it's prefixed with "0x")

export {
  basisPointsToPercent,
  calculateGasMargin,
  calculateSlippageAmount,
  escapeRegExp,
  getContract,
  getProviderOrSigner,
  getRouterContract,
  getSigner,
  isAddress,
  isTokenOnList,
  shortenAddress
} from '@src/utils'

const ETHERSCAN_PREFIXES: { [chainId in ChainId]: string } = {
  1: '',
  3: 'ropsten.',
  4: 'rinkeby.',
  5: 'goerli.',
  42: 'kovan.',
  100: 'xdai.'
}

type BlockExplorerLinkType = 'transaction' | 'token' | 'address' | 'block'

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
    case 'token':
      return `tokens/${data}/token-transfers`
  }
}

function getBlockscoutUrl(chainId: ChainId, data: string, type: BlockExplorerLinkType): string {
  return `https://blockscout.com/${getBlockscoutUrlPrefix(chainId)}/${getBlockscoutUrlSuffix(type, data)}`
}

export function getEtherscanLink(chainId: ChainId, data: string, type: BlockExplorerLinkType): string {
  if (type === 'transaction' && data.length === GP_ORDER_ID_LENGTH) {
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
