import { useWalletInfo } from '@cow/modules/wallet'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import JSBI from 'jsbi'
import { useMemo } from 'react'

import { UNI } from 'constants/tokens'
import { useAllTokens } from '../../hooks/Tokens'
import { useUserUnclaimedAmount } from '../claim/hooks'
import { useTotalUniEarned } from '../stake/hooks'
import { useOnchainBalances } from '@cow/modules/tokens'
import { OnchainTokenAmounts } from '@cow/modules/tokens/hooks/useOnchainBalances'
import { useTokenBalance } from '@cow/modules/tokens/hooks/useCurrencyBalance'

export {
  default as useCurrencyBalance,
  useCurrencyBalances,
  useNativeCurrencyBalances,
  useTokenBalances,
} from '@cow/modules/tokens/hooks/useCurrencyBalance'

// mimics useAllBalances
/**
 * @deprecated
 */
export function useAllTokenBalances(): [OnchainTokenAmounts, boolean] {
  const { account } = useWalletInfo()
  const allTokens = useAllTokens()
  const allTokensArray = useMemo(() => Object.values(allTokens ?? {}), [allTokens])
  const { amounts: balances, isLoading: balancesIsLoading } = useOnchainBalances({
    account: account ?? undefined,
    tokens: allTokensArray,
  })
  return [balances ?? {}, balancesIsLoading]
}

// get the total owned, unclaimed, and unharvested UNI for account
export function useAggregateUniBalance(): CurrencyAmount<Token> | undefined {
  const { account, chainId } = useWalletInfo()

  const uni = chainId ? UNI[chainId] : undefined

  const uniBalance: CurrencyAmount<Token> | undefined = useTokenBalance(account ?? undefined, uni)
  const uniUnclaimed: CurrencyAmount<Token> | undefined = useUserUnclaimedAmount(account)
  const uniUnHarvested: CurrencyAmount<Token> | undefined = useTotalUniEarned()

  if (!uni) return undefined

  return CurrencyAmount.fromRawAmount(
    uni,
    JSBI.add(
      JSBI.add(uniBalance?.quotient ?? JSBI.BigInt(0), uniUnclaimed?.quotient ?? JSBI.BigInt(0)),
      uniUnHarvested?.quotient ?? JSBI.BigInt(0)
    )
  )
}
