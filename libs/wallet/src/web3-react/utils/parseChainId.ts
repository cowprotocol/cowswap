/**
 * Parse chainId for EVM chains (wallet connections are EVM-only)
 * Returns number for use with EVM wallet connectors
 */
export function parseEvmChainId(chainId: string | number): number {
  if (typeof chainId === 'number') return chainId

  if (typeof chainId !== 'string') {
    throw new Error(
      `Invalid EVM chainId: expected string or number, got ${typeof chainId}. Value: ${JSON.stringify(chainId)}`,
    )
  }

  return Number.parseInt(chainId, chainId.startsWith('0x') ? 16 : 10)
}

/**
 * @deprecated Use parseEvmChainId instead
 * Kept for backward compatibility
 */
// TODO remove
export function parseChainId(chainId: string | number): number {
  return parseEvmChainId(chainId)
}
