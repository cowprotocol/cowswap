import { TokenInfo } from '@cowprotocol/types'

type TokensListLike = {
  tokens: TokenInfo[]
}

const hasTokensArray = (value: unknown): value is TokensListLike => {
  return typeof value === 'object' && value !== null && 'tokens' in value && Array.isArray(value.tokens)
}

export const parseCustomTokensInput = (value: string): TokenInfo[] | null => {
  const parsedValue: unknown = JSON.parse(value)

  if (Array.isArray(parsedValue)) {
    return parsedValue as TokenInfo[]
  }

  if (hasTokensArray(parsedValue)) {
    return parsedValue.tokens
  }

  return null
}
