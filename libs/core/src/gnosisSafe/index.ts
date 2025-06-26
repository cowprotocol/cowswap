import { CHAIN_INFO } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { JsonRpcFetchFunc, Web3Provider } from '@ethersproject/providers'
import SafeApiKit, { SafeInfoResponse } from '@safe-global/api-kit'
import Safe, { EthersAdapter } from '@safe-global/protocol-kit'
import type { SafeMultisigTransactionResponse } from '@safe-global/safe-core-sdk-types'

// eslint-disable-next-line no-restricted-imports
import { ethers } from 'ethers'

const SAFE_TRANSACTION_SERVICE_URL: Record<SupportedChainId, string> = {
  [SupportedChainId.MAINNET]: 'https://safe-transaction-mainnet.safe.global',
  [SupportedChainId.GNOSIS_CHAIN]: 'https://safe-transaction-gnosis-chain.safe.global',
  [SupportedChainId.ARBITRUM_ONE]: 'https://safe-transaction-arbitrum.safe.global',
  [SupportedChainId.BASE]: 'https://safe-transaction-base.safe.global',
  [SupportedChainId.SEPOLIA]: 'https://safe-transaction-sepolia.safe.global',
  [SupportedChainId.POLYGON]: 'https://safe-transaction-polygon.safe.global',
  [SupportedChainId.AVALANCHE]: 'https://safe-transaction-avalanche.safe.global',
}

const SAFE_BASE_URL = 'https://app.safe.global'

const SAFE_TRANSACTION_SERVICE_CACHE: Partial<Record<number, SafeApiKit | null>> = {}

function _getClient(chainId: number, library: Web3Provider): SafeApiKit | null {
  const cachedClient = SAFE_TRANSACTION_SERVICE_CACHE[chainId]

  if (cachedClient !== undefined) {
    return cachedClient
  }

  const client = createSafeApiKitInstance(chainId, library)

  // Add client to cache (or null if unknonw network)
  SAFE_TRANSACTION_SERVICE_CACHE[chainId] = client

  return client
}

function _createSafeEthAdapter(library: Web3Provider): EthersAdapter {
  const provider = new Web3Provider(library.send.bind(library) as JsonRpcFetchFunc)

  return new EthersAdapter({
    ethers,
    signerOrProvider: provider.getSigner(0),
  })
}

export function createSafeApiKitInstance(chainId: number, library: Web3Provider): SafeApiKit | null {
  const url = SAFE_TRANSACTION_SERVICE_URL[chainId as SupportedChainId]
  if (!url) {
    return null
  }

  const ethAdapter = _createSafeEthAdapter(library)
  return new SafeApiKit({ txServiceUrl: url, ethAdapter })
}

export async function createSafeSdkInstance(safeAddress: string, library: Web3Provider): Promise<Safe> {
  const ethAdapter = _createSafeEthAdapter(library)

  return Safe.create({ ethAdapter, safeAddress })
}

function _getClientOrThrow(chainId: number, library: Web3Provider): SafeApiKit {
  const client = _getClient(chainId, library)
  if (!client) {
    throw new Error('Unsupported network for Gnosis Safe Transaction Service: ' + chainId)
  }

  return client
}

export function getSafeWebUrl(chainId: SupportedChainId, safeAddress: string, safeTxHash: string): string {
  const chainShortName = CHAIN_INFO[chainId].addressPrefix

  return `${SAFE_BASE_URL}/${chainShortName}:${safeAddress}/transactions/tx?id=multisig_${safeAddress}_${safeTxHash}`
}

export function getSafeAccountUrl(chainId: SupportedChainId, safeAddress: string): string {
  const chainShortName = CHAIN_INFO[chainId].addressPrefix

  return `${SAFE_BASE_URL}/${chainShortName}:${safeAddress}`
}

export function getSafeTransaction(
  chainId: number,
  safeTxHash: string,
  library: Web3Provider,
): Promise<SafeMultisigTransactionResponse> {
  console.log('[api/gnosisSafe] getSafeTransaction', chainId, safeTxHash)
  const client = _getClientOrThrow(chainId, library)

  return client.getTransaction(safeTxHash)
}

export function getSafeInfo(chainId: number, safeAddress: string, library: Web3Provider): Promise<SafeInfoResponse> {
  console.log('[api/gnosisSafe] getSafeInfo', chainId, safeAddress)
  try {
    const client = _getClientOrThrow(chainId, library)

    return client.getSafeInfo(safeAddress)
  } catch (error) {
    return Promise.reject(error)
  }
}
