import { useAtomValue } from 'jotai'
import { ReactNode } from 'react'

import { TradeSpenderOverrideUpdater } from '@cowprotocol/balances-and-allowances'
import { percentToBps, COW_PROTOCOL_VAULT_RELAYER_ADDRESS_PROD } from '@cowprotocol/common-utils'
import { useIsSafeViaWc, useIsSafeWallet, useWalletInfo } from '@cowprotocol/wallet'

import { useComposableCowContractData } from 'modules/advancedOrders/hooks/useComposableCowContract'
import { advancedOrdersSettingsAtom } from 'modules/advancedOrders/state/advancedOrdersSettingsAtom'
import { AppDataUpdater } from 'modules/appData'
import { Erc20ApproveWidget } from 'modules/erc20Approve'

import { CreatedInOrderBookOrdersUpdater } from './CreatedInOrderBookOrdersUpdater'
import { FallbackHandlerVerificationUpdater } from './FallbackHandlerVerificationUpdater'
import { FullAmountQuoteUpdater } from './FullAmountQuoteUpdater'
import { PartOrdersUpdater } from './PartOrdersUpdater'
import { QuoteObserverUpdater } from './QuoteObserverUpdater'
import { QuoteParamsUpdater } from './QuoteParamsUpdater'
import { TwapOrdersUpdater } from './TwapOrdersUpdater'

import { COMPOSABLE_COW_POLLER_ADDRESS } from '../composable-cow-poller/composable-cow-poller.constants'
import { useTwapSlippage } from '../hooks/useTwapSlippage'

export function TwapUpdaters(): ReactNode {
  const { chainId, account } = useWalletInfo()
  const isSafeWallet = useIsSafeWallet()
  const isSafeViaWc = useIsSafeViaWc()
  const composableCowContract = useComposableCowContractData()
  const twapOrderSlippage = useTwapSlippage()
  const { enablePartialApprovalBySettings } = useAtomValue(advancedOrdersSettingsAtom)

  const isSafe = isSafeWallet || isSafeViaWc
  const shouldLoadTwapOrders = !!(isSafe && account && composableCowContract.address)
  const composableCowChainId = composableCowContract.chainId
  // Safe funds settle through the Vault Relayer; EOA funds are pulled just in time by the poller.
  const spenderAddress = chainId
    ? isSafe
      ? COW_PROTOCOL_VAULT_RELAYER_ADDRESS_PROD[chainId]
      : COMPOSABLE_COW_POLLER_ADDRESS[chainId]
    : undefined

  return (
    <>
      <TradeSpenderOverrideUpdater spenderAddress={spenderAddress} />
      <CreatedInOrderBookOrdersUpdater />
      <QuoteParamsUpdater />
      <AppDataUpdater orderClass="twap" slippageBips={percentToBps(twapOrderSlippage)} />
      <QuoteObserverUpdater />
      <Erc20ApproveWidget isPartialApprovalEnabled={enablePartialApprovalBySettings} />
      {shouldLoadTwapOrders && (
        <>
          <FullAmountQuoteUpdater />
          <FallbackHandlerVerificationUpdater />
          <PartOrdersUpdater />
          <TwapOrdersUpdater
            composableCowContract={composableCowContract}
            safeAddress={account}
            chainId={composableCowChainId}
          />
        </>
      )}
    </>
  )
}
