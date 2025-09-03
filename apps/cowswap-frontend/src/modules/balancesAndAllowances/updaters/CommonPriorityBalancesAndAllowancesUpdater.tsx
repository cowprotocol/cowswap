import { ReactNode, useEffect, useMemo, useState } from 'react'

import {
  BalancesAndAllowancesUpdater,
  PRIORITY_TOKENS_REFRESH_INTERVAL,
  PriorityTokensUpdater,
  useIsBffFailed,
} from '@cowprotocol/balances-and-allowances'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useBalancesContext } from 'entities/balancesContext/useBalancesContext'

import { useSourceChainId } from 'modules/tokensList'
import { usePriorityTokenAddresses } from 'modules/trade'

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

  const { isBffBalanceApiEnabled } = useFeatureFlags()
  const isBffFailed = useIsBffFailed()
  const isBffEnabled = isBffBalanceApiEnabled && !isBffFailed

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
      />
    </>
  )
}
