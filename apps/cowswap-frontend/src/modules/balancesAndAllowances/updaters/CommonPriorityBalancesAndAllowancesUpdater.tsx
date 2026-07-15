import { useAtomValue } from 'jotai'
import { ReactNode, useEffect, useMemo, useState } from 'react'

import {
  BalancesAndAllowancesUpdater,
  balancesWatcherHealthAtom,
  BalancesWatcherUpdater,
  PRIORITY_TOKENS_REFRESH_INTERVAL,
  PriorityTokensUpdater,
} from '@cowprotocol/balances-and-allowances'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { isEvmAddress, isNonEvmChain } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useBalancesContext } from 'entities/balancesContext/useBalancesContext'

import { Field } from 'legacy/state/types'

import { useSelectTokenWidgetState, useSourceChainId } from 'modules/tokensList'
import { usePriorityTokenAddresses } from 'modules/trade'

import { useBridgeCustomTokensForChain } from '../hooks/useBridgeCustomTokensForChain'
import { useOrdersFilledEventsTrigger } from '../hooks/useOrdersFilledEventsTrigger'

// Percentage-based rollout: hashes the wallet address into a stable 0..99
// bucket and enables the watcher for buckets below `percentage`. Same account
// -> same bucket, so the toggle is sticky per wallet across sessions/tabs.
// - 100 -> everyone (including not-yet-connected wallets)
// - 0 / undefined / out-of-range / non-number -> nobody
// Non-EVM (e.g. Solana base58) accounts are rejected before BigInt() to avoid
// a render-time SyntaxError; sourceChainId alone can't guard this because it
// may be selector-derived while the wallet is on a non-EVM chain.
function shouldEnableBalancesWatcher(account: string | undefined, percentage: number | boolean | undefined): boolean {
  if (percentage === 100) return true
  if (typeof percentage !== 'number' || !account || percentage < 0 || percentage > 100) return false
  if (!isEvmAddress(account)) return false

  return BigInt(account) % 100n < percentage
}

export function CommonPriorityBalancesAndAllowancesUpdater(): ReactNode {
  const { chainId: sourceChainId, source: sourceChainSource } = useSourceChainId()
  // Bridge buy-tokens are only meaningful for the output/buy selector. The input/sell selector on a non-wallet chain
  // also yields source='selector' but must keep the normal token-list + user-custom-tokens session.
  const { field } = useSelectTokenWidgetState()
  const isBridgeMode = sourceChainSource === 'selector' && field === Field.OUTPUT
  const { account } = useWalletInfo()
  const balancesContext = useBalancesContext()
  const balancesAccount = balancesContext.account || account

  const { bwEnabledPercentage } = useFeatureFlags()

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

  const refreshTrigger = useOrdersFilledEventsTrigger()

  const bridgeTokenList = useBridgeCustomTokensForChain(sourceChainId)

  const { isRecovering: isWatcherRecovering } = useAtomValue(balancesWatcherHealthAtom)
  const isWatcherActive = shouldEnableBalancesWatcher(account, bwEnabledPercentage) && !isNonEvmChain(sourceChainId)
  // Mount the multicall stack when:
  // - the watcher isn't running at all (bw flag off, or non-EVM chain), OR
  // - the watcher is in recovery — sticky from the first failure until the next
  //   successful snapshot, so retry transitions (Connecting/Connected/Fallback)
  //   don't briefly unmount it and leave a balance gap.
  const needsMulticallStack = !isWatcherActive || isWatcherRecovering
  const multicallStack = needsMulticallStack ? (
    <>
      <PriorityTokensUpdater
        // We can and should save one RPC call at the very beginning
        // Since regular BalancesAndAllowancesUpdater will update all tokens (including priority tokens)
        // We can skip first update for PriorityTokensUpdater
        account={skipFirstPriorityUpdate ? undefined : balancesAccount}
        chainId={sourceChainId}
        tokenAddresses={priorityTokenAddressesAsArray}
      />
      <BalancesAndAllowancesUpdater
        account={balancesAccount}
        chainId={sourceChainId}
        excludedTokens={priorityTokenAddresses}
        refreshTrigger={refreshTrigger}
      />
    </>
  ) : null

  if (isWatcherActive) {
    return (
      <>
        <BalancesWatcherUpdater
          account={balancesAccount}
          chainId={sourceChainId}
          isBridgeMode={isBridgeMode}
          bridgeTokenList={bridgeTokenList}
        />
        {multicallStack}
      </>
    )
  }

  return multicallStack
}
