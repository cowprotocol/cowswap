import { LpToken } from '@cowprotocol/common-const'
import { LP_TOKEN_LIST_CATEGORIES, LP_TOKEN_LIST_COW_AMM_ONLY, TokenListCategory } from '@cowprotocol/tokens'
import { Currency } from '@uniswap/sdk-core'

import { Field } from 'legacy/state/types'

export function getDefaultTokenListCategories(
  field: Field | undefined,
  oppositeToken: Currency | LpToken | undefined,
  lpTokensWithBalancesCount: number,
): TokenListCategory[] | null {
  // When select buy token
  if (field === Field.OUTPUT) {
    // If sell token is LP token, then propose COW AMM pools by default as buy token
    // If sell token is ERC-20 token, then propose all LP tokens by default as buy token
    return oppositeToken instanceof LpToken ? LP_TOKEN_LIST_COW_AMM_ONLY : LP_TOKEN_LIST_CATEGORIES
  }

  // When select sell token
  // If there are LP tokens with balances, propose LP tokens by default as sell token
  return lpTokensWithBalancesCount > 0 ? LP_TOKEN_LIST_CATEGORIES : null
}
