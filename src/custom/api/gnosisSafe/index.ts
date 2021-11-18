import SafeServiceClient, { SafeInfoResponse, SafeMultisigTransactionResponse } from '@gnosis.pm/safe-service-client'
import { registerOnWindow } from 'utils/misc'
import { ChainId } from '@uniswap/sdk'

const SAFE_TRANSACTION_SERVICE_URL: Partial<Record<number, string>> = {
  [ChainId.MAINNET]: 'https://safe-transaction.gnosis.io',
  [ChainId.RINKEBY]: 'https://safe-transaction.rinkeby.gnosis.io',
  [ChainId.XDAI]: 'https://safe-transaction.xdai.gnosis.io',
}

const SAFE_BASE_URL = 'https://gnosis-safe.io'
const CHAIN_SHORT_NAME: Partial<Record<number, string>> = {
  [ChainId.MAINNET]: 'eth', // https://github.com/ethereum-lists/chains/blob/master/_data/chains/eip155-1.json
  [ChainId.RINKEBY]: 'rin', // https://github.com/ethereum-lists/chains/blob/master/_data/chains/eip155-4.json
  [ChainId.XDAI]: 'xdai', // https://github.com/ethereum-lists/chains/blob/master/_data/chains/eip155-100.json
}

const SAFE_TRANSACTION_SERVICE_CACHE: Partial<Record<number, SafeServiceClient | null>> = {}

function _getClient(chainId: number): SafeServiceClient | null {
  let client = SAFE_TRANSACTION_SERVICE_CACHE[chainId]
  if (client === undefined) {
    const url = SAFE_TRANSACTION_SERVICE_URL[chainId]
    if (!url) {
      client = null
    } else {
      client = new SafeServiceClient(url)
    }

    // Add client to cache (or null if unknonw network)
    SAFE_TRANSACTION_SERVICE_CACHE[chainId] = client
  }

  return client
}

function _getClientOrThrow(chainId: number): SafeServiceClient {
  const client = _getClient(chainId)
  if (!client) {
    throw new Error('Unsupported network for Gnosis Safe Transaction Service: ' + chainId)
  }

  return client
}

export function getSafeWebUrl(chaindId: number, safeAddress: string, isPending: boolean): string | null {
  const chainShortName = CHAIN_SHORT_NAME[chaindId]

  if (!chainShortName) {
    return null
  }

  return `${SAFE_BASE_URL}/app/${chainShortName}:${safeAddress}/transactions/${isPending ? 'queue' : 'history'}` // TODO: This will change soon in https://github.com/gnosis/safe-react/issues/970
}

export function getSafeTransaction(chainId: number, safeTxHash: string): Promise<SafeMultisigTransactionResponse> {
  console.log('[api/gnosisSafe] getSafeTransaction', chainId, safeTxHash)
  const client = _getClientOrThrow(chainId)
  return client.getTransaction(safeTxHash)
}

export function getSafeInfo(chainId: number, safeAddress: string): Promise<SafeInfoResponse> {
  console.log('[api/gnosisSafe] getSafeInfo', chainId, safeAddress)
  const client = _getClientOrThrow(chainId)

  return client.getSafeInfo(safeAddress)
}

registerOnWindow({ getSafeTransaction, getSafeInfo })
