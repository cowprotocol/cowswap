import { ReactNode, useEffect, useMemo } from 'react'

import { LpToken, NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import type { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useAllActiveTokens, useTokensByAddressMapForChain } from '@cowprotocol/tokens'

import ms from 'ms.macro'

import { BalancesCacheUpdater } from './BalancesCacheUpdater'
import { BalancesResetUpdater } from './BalancesResetUpdater'
import { BalancesRpcCallUpdater } from './BalancesRpcCallUpdater'

import { BASIC_BALANCES_QUERY_CONFIG } from '../consts'
import { useNativeTokenBalance } from '../hooks/useNativeTokenBalance'
import { useSwrConfigWithPauseForNetwork } from '../hooks/useSwrConfigWithPauseForNetwork'
import { useUpdateTokenBalance } from '../hooks/useUpdateTokenBalance'

// A small gap between balances and allowances refresh intervals is needed to avoid high load to the node at the same time
const RPC_BALANCES_QUERY_CONFIG = { ...BASIC_BALANCES_QUERY_CONFIG, refetchInterval: ms`31s` }

const EMPTY_TOKENS: string[] = []

export interface BalancesAndAllowancesUpdaterProps {
  account: string | undefined
  chainId: SupportedChainId
  excludedTokens: Set<string>
}

export function BalancesAndAllowancesUpdater({
  account,
  chainId,
  excludedTokens,
}: BalancesAndAllowancesUpdaterProps): ReactNode {
  const updateTokenBalance = useUpdateTokenBalance()

  const allTokens = useAllActiveTokens()

  const targetChainTokensMap = useTokensByAddressMapForChain(chainId)
  const { data: nativeTokenBalance } = useNativeTokenBalance(account, chainId)

  const tokenAddresses = useMemo(() => {
    if (allTokens.chainId !== chainId) {
      // Use tokens from target chain's token lists when viewing a different chain
      const addresses = Object.keys(targetChainTokensMap)
      if (addresses.length > 0) {
        return addresses
      }
      return EMPTY_TOKENS
    }

    return allTokens.tokens.reduce<string[]>((acc, token) => {
      if (!(token instanceof LpToken)) {
        acc.push(token.address)
      }
      return acc
    }, [])
  }, [allTokens, chainId, targetChainTokensMap])

  const rpcBalancesQueryConfig = useSwrConfigWithPauseForNetwork(chainId, account, RPC_BALANCES_QUERY_CONFIG)

  // Add native token balance to the store as well
  useEffect(() => {
    const nativeToken = NATIVE_CURRENCIES[chainId]

    if (nativeToken && nativeTokenBalance) {
      updateTokenBalance(nativeToken.address, nativeTokenBalance.value)
    }
  }, [nativeTokenBalance, chainId, updateTokenBalance])

  return (
    <>
      <BalancesRpcCallUpdater
        account={account}
        chainId={chainId}
        tokenAddresses={tokenAddresses}
        balancesQueryConfig={rpcBalancesQueryConfig}
        setLoadingState
      />
      <BalancesResetUpdater chainId={chainId} account={account} />
      <BalancesCacheUpdater chainId={chainId} account={account} excludedTokens={excludedTokens} />
    </>
  )
}
