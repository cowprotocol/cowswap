import { CHAIN_INFO } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { SafeInfoResponse, default as SafeApiKitType } from '@safe-global/api-kit'
import type { SafeMultisigTransactionResponse } from '@safe-global/types-kit'

export const SAFE_TRANSACTION_SERVICE_URL: Record<SupportedChainId, string> = {
  [SupportedChainId.MAINNET]: 'https://safe-transaction-mainnet.safe.global',
  [SupportedChainId.GNOSIS_CHAIN]: 'https://safe-transaction-gnosis-chain.safe.global',
  [SupportedChainId.ARBITRUM_ONE]: 'https://safe-transaction-arbitrum.safe.global',
  [SupportedChainId.BASE]: 'https://safe-transaction-base.safe.global',
  [SupportedChainId.SEPOLIA]: 'https://safe-transaction-sepolia.safe.global',
  [SupportedChainId.POLYGON]: 'https://safe-transaction-polygon.safe.global',
  [SupportedChainId.AVALANCHE]: 'https://safe-transaction-avalanche.safe.global',
  [SupportedChainId.LENS]: 'https://safe-transaction-lens.safe.global',
  [SupportedChainId.BNB]: 'https://safe-transaction-bsc.safe.global',
  [SupportedChainId.LINEA]: 'https://safe-transaction-linea.safe.global',
  [SupportedChainId.PLASMA]: 'https://safe-transaction-plasma.safe.global',
}

const SAFE_BASE_URL = 'https://app.safe.global'

const SAFE_TRANSACTION_SERVICE_CACHE: Partial<Record<number, SafeApiKitType | null>> = {}

async function _getClient(chainId: number): Promise<SafeApiKitType | null> {
  const cachedClient = SAFE_TRANSACTION_SERVICE_CACHE[chainId]

  if (cachedClient !== undefined) {
    return cachedClient
  }

  const client = await createSafeApiKitInstance(chainId)

  // Add client to cache (or null if unknown network)
  SAFE_TRANSACTION_SERVICE_CACHE[chainId] = client

  return client
}

export async function createSafeApiKitInstance(chainId: number): Promise<SafeApiKitType | null> {
  const url = SAFE_TRANSACTION_SERVICE_URL[chainId as SupportedChainId]
  if (!url) {
    return null
  }

  const SafeApiKit = await import('../imports/safeApiKit').then((r) => r.default)

  return new SafeApiKit({ txServiceUrl: url, chainId: BigInt(chainId) })
}

async function _getClientOrThrow(chainId: number): Promise<SafeApiKitType> {
  const client = await _getClient(chainId)
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

export async function getSafeTransaction(
  chainId: number,
  safeTxHash: string,
): Promise<SafeMultisigTransactionResponse> {
  console.log('[api/gnosisSafe] getSafeTransaction', chainId, safeTxHash)
  const client = await _getClientOrThrow(chainId)

  return client.getTransaction(safeTxHash)
}

export async function getSafeInfo(chainId: number, safeAddress: string): Promise<SafeInfoResponse> {
  console.log('[api/gnosisSafe] getSafeInfo', chainId, safeAddress)
  try {
    const client = await _getClientOrThrow(chainId)

    return client.getSafeInfo(safeAddress)
  } catch (error) {
    return Promise.reject(error)
  }
}
