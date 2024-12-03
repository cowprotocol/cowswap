import { LpToken } from '@cowprotocol/common-const'
import { LP_TOKEN_LIST_CATEGORIES, LP_TOKEN_LIST_COW_AMM_ONLY, TokenListCategory } from '@cowprotocol/tokens'
import { LpTokenProvider } from '@cowprotocol/types'
import { Currency } from '@uniswap/sdk-core'

import { Field } from 'legacy/state/types'

export function getDefaultTokenListCategories(
  field: Field | undefined,
  oppositeToken: Currency | LpToken | undefined,
  lpTokensWithBalancesCount: number,
): TokenListCategory[] | null {
  const isOppositeLp = oppositeToken instanceof LpToken

  // When select buy token
  if (field === Field.OUTPUT) {
    // If sell token is LP token
    if (isOppositeLp) {
      // And sell token is COW AMM LP token, propose all LP tokens by default as buy token
      if (oppositeToken.lpTokenProvider === LpTokenProvider.COW_AMM) {
        return LP_TOKEN_LIST_CATEGORIES
      } else {
        // And sell token is not COW AMM LP token, propose COW AMM LP tokens by default as buy token
        return LP_TOKEN_LIST_COW_AMM_ONLY
      }
    } else {
      // And sell token is not LP token, propose all LP tokens by default as buy token
      return LP_TOKEN_LIST_COW_AMM_ONLY
    }
  }

  if (isOppositeLp && oppositeToken.lpTokenProvider === LpTokenProvider.COW_AMM) {
    return LP_TOKEN_LIST_CATEGORIES
  }

  // When select sell token
  // If there are LP tokens with balances, propose LP tokens by default as sell token
  return lpTokensWithBalancesCount > 0 ? LP_TOKEN_LIST_CATEGORIES : null
}
