import { useAtomValue } from 'jotai'
import { ReactNode, useEffect, useMemo, useState } from 'react'

import {
  BalancesAndAllowancesUpdater,
  balancesWatcherHealthAtom,
  BalancesWatcherUpdater,
  PRIORITY_TOKENS_REFRESH_INTERVAL,
  PriorityTokensUpdater,
} from '@cowprotocol/balances-and-allowances'
import { isEvmChain, isSolanaChain, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useSolanaAccount, useWalletInfo } from '@cowprotocol/wallet'

import { useBalancesContext } from 'entities/balancesContext/useBalancesContext'

import { Field } from 'legacy/state/types'

import { useSelectTokenWidgetState, useSourceChainId } from 'modules/tokensList'
import { usePriorityTokenAddresses } from 'modules/trade'

import { useBridgeCustomTokensForChain } from '../hooks/useBridgeCustomTokensForChain'
import { useOrdersFilledEventsTrigger } from '../hooks/useOrdersFilledEventsTrigger'

export function CommonPriorityBalancesAndAllowancesUpdater(): ReactNode {
  const { chainId: sourceChainId, source: sourceChainSource } = useSourceChainId()
  // Bridge buy-tokens are only meaningful for the output/buy selector. The input/sell selector on a non-wallet chain
  // also yields source='selector' but must keep the normal token-list + user-custom-tokens session.
  const { field } = useSelectTokenWidgetState()
  const isBridgeMode = sourceChainSource === 'selector' && field === Field.OUTPUT
  const { account } = useWalletInfo()
  const solanaAccount = useSolanaAccount()
  const balancesContext = useBalancesContext()
  // Browsing Solana as a bridge destination (buy selector) doesn't switch the active wallet
  // session, so useWalletInfo().account still resolves to the EVM address here — use the
  // Solana-namespaced account instead so Solana balance fetching gets a valid public key.
  const balancesAccount = isSolanaChain(sourceChainId) ? solanaAccount : balancesContext.account || account

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
  const isWatcherActive = isEvmChain(sourceChainId)
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
          chainId={sourceChainId as number as SupportedChainId}
          isBridgeMode={isBridgeMode}
          bridgeTokenList={bridgeTokenList}
        />
        {multicallStack}
      </>
    )
  }

  return multicallStack
}
