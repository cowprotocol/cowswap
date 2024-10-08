import { percentToBps } from '@cowprotocol/common-utils'
import { useIsSafeApp, useWalletInfo } from '@cowprotocol/wallet'

import { useComposableCowContract } from 'modules/advancedOrders/hooks/useComposableCowContract'
import { AppDataUpdater } from 'modules/appData'

import { CreatedInOrderBookOrdersUpdater } from './CreatedInOrderBookOrdersUpdater'
import { FallbackHandlerVerificationUpdater } from './FallbackHandlerVerificationUpdater'
import { FullAmountQuoteUpdater } from './FullAmountQuoteUpdater'
import { PartOrdersUpdater } from './PartOrdersUpdater'
import { QuoteObserverUpdater } from './QuoteObserverUpdater'
import { QuoteParamsUpdater } from './QuoteParamsUpdater'
import { TwapOrdersUpdater } from './TwapOrdersUpdater'

import { useTwapSlippage } from '../hooks/useTwapSlippage'

export function TwapUpdaters() {
  const { chainId, account } = useWalletInfo()
  const isSafeApp = useIsSafeApp()
  const composableCowContract = useComposableCowContract()
  const twapOrderSlippage = useTwapSlippage()

  const shouldLoadTwapOrders = !!(isSafeApp && chainId && account && composableCowContract)

  return (
    <>
      <CreatedInOrderBookOrdersUpdater />
      <QuoteParamsUpdater />
      <AppDataUpdater orderClass="twap" slippageBips={percentToBps(twapOrderSlippage)} />
      <QuoteObserverUpdater />
      {shouldLoadTwapOrders && (
        <>
          <FullAmountQuoteUpdater />
          <FallbackHandlerVerificationUpdater />
          <PartOrdersUpdater />
          <TwapOrdersUpdater composableCowContract={composableCowContract} safeAddress={account} chainId={chainId} />
        </>
      )}
    </>
  )
}
