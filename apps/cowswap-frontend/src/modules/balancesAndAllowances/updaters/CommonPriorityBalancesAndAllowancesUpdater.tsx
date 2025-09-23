import { ReactNode, useEffect, useMemo, useState } from 'react'

import {
  BalancesAndAllowancesUpdater,
  PRIORITY_TOKENS_REFRESH_INTERVAL,
  PriorityTokensUpdater,
  useIsBffFailed,
} from '@cowprotocol/balances-and-allowances'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useBalancesContext } from 'entities/balancesContext/useBalancesContext'

import { useSourceChainId } from 'modules/tokensList'
import { usePendingOrdersCount, usePriorityTokenAddresses } from 'modules/trade'

const UNSUPPORTED_BFF_NETWORKS = [SupportedChainId.LENS]

function shouldApplyBffBalances(account: string | undefined, percentage: number | boolean | undefined): boolean {
  // Early exit for 100%, meaning should be enabled for everyone
  if (percentage === 100) {
    return true
  }

  // Falsy conditions
  if (typeof percentage !== 'number' || !account || percentage < 0 || percentage > 100) {
    return false
  }

  return BigInt(account) % 100n < percentage
}

export function CommonPriorityBalancesAndAllowancesUpdater(): ReactNode {
  const sourceChainId = useSourceChainId().chainId
  const { account } = useWalletInfo()
  const balancesContext = useBalancesContext()
  const balancesAccount = balancesContext.account || account

  const priorityTokenAddresses = usePriorityTokenAddresses()
  const priorityTokenAddressesAsArray = useMemo(() => {
    return Array.from(priorityTokenAddresses.values())
  }, [priorityTokenAddresses])
  const priorityTokenCount = priorityTokenAddressesAsArray.length

  const [skipFirstPriorityUpdate, setSkipFirstPriorityUpdate] = useState(true)

  /**
   * Reset skipFirstPriorityUpdate on every network change
   */
  useEffect(() => {
    setSkipFirstPriorityUpdate(true)
  }, [sourceChainId])

  /**
   * Stop skipping priority tokens updating once wallet is connected and there are some priority tokens
   */
  useEffect(() => {
    if (!account || !priorityTokenCount) return

    const timeout = setTimeout(() => {
      setSkipFirstPriorityUpdate(false)
    }, PRIORITY_TOKENS_REFRESH_INTERVAL)

    return () => {
      clearTimeout(timeout)
    }
  }, [account, priorityTokenCount])

  const { bffBalanceEnabledPercentage } = useFeatureFlags()
  const isBffFailed = useIsBffFailed()
  const isBffUnsupportedNetwork = UNSUPPORTED_BFF_NETWORKS.includes(sourceChainId)
  const isBffEnabled =
    shouldApplyBffBalances(account, bffBalanceEnabledPercentage) && !isBffFailed && !isBffUnsupportedNetwork
  const pendingOrdersCount = usePendingOrdersCount(sourceChainId, balancesAccount)

  return (
    <>
      {!isBffEnabled ? (
        <PriorityTokensUpdater
          // We can and should save one RPC call at the very beginning
          // Since regular BalancesAndAllowancesUpdater will update all tokens (including priority tokens)
          // We can skip first update for PriorityTokensUpdater
          account={skipFirstPriorityUpdate ? undefined : balancesAccount}
          chainId={sourceChainId}
          tokenAddresses={priorityTokenAddressesAsArray}
        />
      ) : null}
      <BalancesAndAllowancesUpdater
        account={balancesAccount}
        chainId={sourceChainId}
        isBffEnabled={isBffEnabled}
        excludedTokens={priorityTokenAddresses}
        pendingOrdersCount={pendingOrdersCount}
      />
    </>
  )
}
