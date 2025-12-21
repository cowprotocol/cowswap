export function parseChainId(chainId: string | number): number {
  if (typeof chainId === 'number') return chainId

  if (typeof chainId !== 'string') {
    throw new Error(
      `Invalid chainId: expected string or number, got ${typeof chainId}. Value: ${JSON.stringify(chainId)}`,
    )
  }

  return Number.parseInt(chainId, chainId.startsWith('0x') ? 16 : 10)
}
