import { CHAIN_INFO } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

export enum ExplorerDataType {
  TRANSACTION = 'transaction',
  TOKEN = 'token',
  ADDRESS = 'address',
  BLOCK = 'block',
}

/**
 * Environment variable to override the block explorer URL.
 * Useful for local development with tools like Otterscan.
 *
 * When set, this URL will be used instead of the chain's default block explorer (e.g., Etherscan).
 * The URL should not include a trailing slash.
 *
 * @example
 * REACT_APP_BLOCK_EXPLORER_URL=http://localhost:8003
 */
const BLOCK_EXPLORER_URL_OVERRIDE = process.env.REACT_APP_BLOCK_EXPLORER_URL

/**
 * Return the explorer link for the given data and data type
 * @param chainId the ID of the chain for which to return the data
 * @param data the data to return a link for
 * @param type the type of the data
 * @param defaultPrefix
 */
export function getExplorerLink(
  chainId: number,
  data: string,
  type: ExplorerDataType,
  defaultPrefix = 'https://etherscan.io',
): string {
  // Allow override via environment variable for local development (e.g., Otterscan)
  const prefix = BLOCK_EXPLORER_URL_OVERRIDE || CHAIN_INFO[chainId as SupportedChainId]?.explorer || defaultPrefix

  switch (type) {
    case ExplorerDataType.TRANSACTION:
      return `${prefix}/tx/${data}`

    case ExplorerDataType.TOKEN:
      return `${prefix}/token/${data}`

    case ExplorerDataType.BLOCK:
      return `${prefix}/block/${data}`

    case ExplorerDataType.ADDRESS:
      return `${prefix}/address/${data}`
    default:
      return `${prefix}`
  }
}
