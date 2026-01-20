import { getTokenId } from './tokens'

interface TokenLike {
  chainId: number
  address: string
}

export function areTokensEqual(a: TokenLike | undefined | null, b: TokenLike | undefined | null): boolean {
  if (!a || !b) return false

  return getTokenId(a) === getTokenId(b)
}
