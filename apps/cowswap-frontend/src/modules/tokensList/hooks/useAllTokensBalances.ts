import { useMemo } from 'react'

import { TokenWithLogo } from '@cowprotocol/common-const'
import { useAllTokens } from '@cowprotocol/tokens'
import { useWalletInfo } from '@cowprotocol/wallet'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { OnchainState, TokenAmounts, useOnchainBalances } from 'modules/tokens'

import { useNativeBalance } from 'common/hooks/useNativeBalance'

const defaultBalancesState: [TokenAmounts, boolean] = [{}, false]

/**
 * Returns balances for all tokens + native token
 */
export function useAllTokensBalances(): [TokenAmounts, boolean] {
  const { account } = useWalletInfo()
  const allTokens = useAllTokens()
  const nativeBalance = useNativeBalance()
  const { amounts: onChainBalances, isLoading } = useOnchainBalances({ account, tokens: allTokens })

  const balances = useMemo(() => {
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

  if (!balances) return defaultBalancesState

  return [balances, isLoading]
}
