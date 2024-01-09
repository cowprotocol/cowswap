import { Network } from 'types'

export type BlockExplorerLinkType = 'tx' | 'address' | 'contract' | 'token' | 'event'

function getEtherscanUrlPrefix(networkId: Network): string {
  return !networkId || networkId === Network.MAINNET || networkId === Network.GNOSIS_CHAIN
    ? ''
    : (Network[networkId] || '').toLowerCase() + '.'
}

function getEtherscanUrlSuffix(type: BlockExplorerLinkType, identifier: string): string {
  switch (type) {
    case 'tx':
      return `tx/${identifier}`
    case 'event':
      return `tx/${identifier}#eventlog`
    case 'address':
      return `address/${identifier}`
    case 'contract':
      return `address/${identifier}#code`
    case 'token':
      return `token/${identifier}`
  }
}

function getEtherscanUrl(host: string, networkId: number, type: BlockExplorerLinkType, identifier: string): string {
  return `https://${getEtherscanUrlPrefix(networkId)}${host}/${getEtherscanUrlSuffix(type, identifier)}`
}

export function getExplorerUrl(networkId: number, type: BlockExplorerLinkType, identifier: string): string {
  return networkId === Network.GNOSIS_CHAIN
    ? getEtherscanUrl('gnosisscan.io', networkId, type, identifier)
    : getEtherscanUrl('etherscan.io', networkId, type, identifier)
}
