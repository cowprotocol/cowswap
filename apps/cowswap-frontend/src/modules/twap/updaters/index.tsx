import { useAtomValue } from 'jotai'
import { ReactNode } from 'react'

import { TradeSpenderOverrideUpdater } from '@cowprotocol/balances-and-allowances'
import { percentToBps, COW_PROTOCOL_VAULT_RELAYER_ADDRESS_PROD } from '@cowprotocol/common-utils'
import { isEvmChain } from '@cowprotocol/cow-sdk'
import { isSafeViaWcAtom, isSafeWalletAtom, useWalletInfo } from '@cowprotocol/wallet'

import { advancedOrdersSettingsAtom, useComposableCowContractData } from 'modules/advancedOrders'
import { AppDataUpdater } from 'modules/appData'
import { Erc20ApproveWidget } from 'modules/erc20Approve'

import { CreatedInOrderBookOrdersUpdater } from './CreatedInOrderBookOrdersUpdater'
import { FallbackHandlerVerificationUpdater } from './FallbackHandlerVerificationUpdater'
import { FullAmountQuoteUpdater } from './FullAmountQuoteUpdater'
import { QuoteObserverUpdater } from './QuoteObserverUpdater'
import { QuoteParamsUpdater } from './QuoteParamsUpdater'
import { TriggerAppziTwapSurveyUpdater } from './TriggerAppziTwapSurveyUpdater'

import { COMPOSABLE_COW_POLLER_ADDRESS } from '../composable-cow-poller/composable-cow-poller.constants'
import { useTwapSlippage } from '../hooks/useTwapSlippage'

export function TwapUpdaters(): ReactNode {
  const { chainId, account } = useWalletInfo()
  const isSafeWallet = useAtomValue(isSafeWalletAtom)
  const isSafeViaWc = useAtomValue(isSafeViaWcAtom) === true
  const composableCowContract = useComposableCowContractData()
  const twapOrderSlippage = useTwapSlippage()
  const { enablePartialApprovalBySettings } = useAtomValue(advancedOrdersSettingsAtom)

  const isSafe = isSafeWallet || isSafeViaWc
  const hasSafeContext = !!(isSafe && account && composableCowContract.address)
  // Safe funds settle through the Vault Relayer; EOA funds are pulled just in time by the poller.
  const spenderAddress = chainId
    ? isSafe
      ? COW_PROTOCOL_VAULT_RELAYER_ADDRESS_PROD[chainId]
      : isEvmChain(chainId)
        ? COMPOSABLE_COW_POLLER_ADDRESS[chainId]
        : undefined
    : undefined

  return (
    <>
      <TriggerAppziTwapSurveyUpdater />
      <TradeSpenderOverrideUpdater spenderAddress={spenderAddress} />
      {!isSafe && <CreatedInOrderBookOrdersUpdater />}
      <QuoteParamsUpdater />
      <AppDataUpdater orderClass="twap" slippageBips={percentToBps(twapOrderSlippage)} />
      <QuoteObserverUpdater />
      <Erc20ApproveWidget isPartialApprovalEnabled={enablePartialApprovalBySettings} />
      {hasSafeContext && (
        <>
          <FullAmountQuoteUpdater />
          <FallbackHandlerVerificationUpdater />
        </>
      )}
    </>
  )
}
