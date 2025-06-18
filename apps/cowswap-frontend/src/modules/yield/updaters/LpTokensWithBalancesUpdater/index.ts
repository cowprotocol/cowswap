import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { useTokensBalances } from '@cowprotocol/balances-and-allowances'
import { useAllLpTokens, TokenListCategory } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'

import { LP_TOKENS_WITH_BALANCES_DEFAULT_STATE, lpTokensWithBalancesAtom } from '../../state/lpTokensWithBalancesAtom'

const LP_CATEGORY = [TokenListCategory.LP]

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function LpTokensWithBalancesUpdater() {
  const { account } = useWalletInfo()
  const lpTokens = useAllLpTokens(LP_CATEGORY)
  const { values: balances } = useTokensBalances()
  const setState = useSetAtom(lpTokensWithBalancesAtom)

  useEffect(() => {
    if (!lpTokens.length) return

    const state = lpTokens.reduce((acc, token) => {
      const addressLower = token.address.toLowerCase()
      const balance = balances[addressLower]

      if (balance && !balance.isZero()) {
        acc.count++
        acc.tokens[addressLower] = { token, balance }
      }

      return acc
    }, LP_TOKENS_WITH_BALANCES_DEFAULT_STATE())

    setState(state)
  }, [setState, lpTokens, balances])

  useEffect(() => {
    if (!account) {
      setState(LP_TOKENS_WITH_BALANCES_DEFAULT_STATE())
    }
  }, [account, setState])

  return null
}
