import { SupportedChainId } from '@cowprotocol/cow-sdk'

/**
 * Returns the input chain ID if chain is supported. If not, return undefined
 * @param chainId a chain ID, which will be returned if it is a supported chain ID
 */
export function supportedChainId(chainId: number | undefined): SupportedChainId | undefined {
  if (isSupportedChain(chainId)) {
    return chainId
  }
  return undefined
}

// Mod
export function isSupportedChain(chainId?: number): chainId is SupportedChainId {
  if (!chainId) {
    return false
  }

  return typeof chainId === 'number' && chainId in SupportedChainId && SUPPORTED_CHAIN_IDS.includes(chainId)
}

export function getSupportedChainIds(): number[] {
  const supportedChainIdsEnv = process.env.REACT_APP_SUPPORTED_CHAIN_IDS

  if (!supportedChainIdsEnv) {
    throw new Error(`REACT_APP_NETWORK_URL must be a defined environment variable`)
  }

  return supportedChainIdsEnv.split(',').map((chainId) => Number(chainId.trim()))
}

export const SUPPORTED_CHAIN_IDS = getSupportedChainIds()
