import { SupportedChainId } from '../constants/chains'

export function isSupportedChain(chainId?: number): chainId is SupportedChainId {
  if (!chainId) return false
  return Boolean(SupportedChainId[chainId])
}

/**
 * Returns the input chain ID if chain is supported. If not, return undefined
 * @param chainId a chain ID, which will be returned if it is a supported chain ID
 */
//  export function supportedChainId(chainId: number): number | undefined {
export function supportedChainId(chainId?: number): SupportedChainId | undefined {
  if (isSupportedChain(chainId)) {
    return chainId
  }
  return undefined
}
