import { SupportedChainId } from '@cowprotocol/cow-sdk'

/**
 * Resolves the chain ID to display for a recipient address
 * 
 * @param recipientChainId - The chain ID from recipient input (may be unsupported)
 * @param currentChainId - The current wallet chain ID (always valid)  
 * @param fallbackChainId - Optional fallback chain ID for complex scenarios
 * @returns A valid SupportedChainId for display purposes
 */
export function resolveDisplayChainId(
  recipientChainId: number | undefined,
  currentChainId: SupportedChainId,
  fallbackChainId?: SupportedChainId,
): SupportedChainId {
  if (recipientChainId !== undefined && Object.values(SupportedChainId).includes(recipientChainId as SupportedChainId)) {
    return recipientChainId as SupportedChainId
  }
  return fallbackChainId || currentChainId
}