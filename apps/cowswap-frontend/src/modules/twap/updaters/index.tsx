import { percentToBps } from '@cowprotocol/common-utils'
import { useIsSafeWallet, useWalletInfo } from '@cowprotocol/wallet'

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

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function TwapUpdaters() {
  const { account } = useWalletInfo()
  const isSafeWallet = useIsSafeWallet()
  const { contract: composableCowContract, chainId: composableCowChainId } = useComposableCowContract()
  const twapOrderSlippage = useTwapSlippage()

  const shouldLoadTwapOrders = !!(isSafeWallet && account && composableCowContract)

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
