import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { useWalletInfo } from '@cowprotocol/wallet'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { OnchainState, TokenAmounts, useOnchainBalances } from 'modules/tokens'

import { useNativeBalance } from 'common/hooks/useNativeBalance'

/**
 * Returns balances for all tokens + native token
 */
export function useBalancesForTokensList(allTokens: TokenWithLogo[]): TokenAmounts | null {
  const { account } = useWalletInfo()
  const nativeBalance = useNativeBalance()
  const { amounts: onChainBalances, isLoading } = useOnchainBalances({ account, tokens: allTokens })

  return useMemo(() => {
    if (!account || !onChainBalances) return null

    if (!nativeBalance.data) return onChainBalances

    const { data, error } = nativeBalance

    const nativeOnChainState: OnchainState<CurrencyAmount<TokenWithLogo>> = {
      value: data,
      loading: isLoading,
      error,
      syncing: false,
      valid: true,
    }

    return { ...onChainBalances, [data.currency.address]: nativeOnChainState }
  }, [account, onChainBalances, nativeBalance, isLoading])
}
