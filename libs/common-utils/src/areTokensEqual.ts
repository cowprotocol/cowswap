interface TokenLike {
  chainId: number
  address: string
}

export type TokenId = `${number}:${string}`

export function getTokenId(chainId: number, address: string): TokenId {
  return `${chainId}:${address.toLowerCase()}`
}

export function areTokensEqual(a: TokenLike | undefined | null, b: TokenLike | undefined | null): boolean {
  if (!a || !b) return false

  return getTokenId(a.chainId, a.address) === getTokenId(b.chainId, b.address)
}
