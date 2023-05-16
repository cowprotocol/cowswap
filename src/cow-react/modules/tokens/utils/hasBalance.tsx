import { CurrencyAmount, Token } from '@uniswap/sdk-core'

interface HasBalanceParams {
  balance?: CurrencyAmount<Token>
}

export function hasBalance({ balance }: HasBalanceParams) {
  if (!balance) {
    return false
  }

  return balance.greaterThan(0)
}
