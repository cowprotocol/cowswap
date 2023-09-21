import { useAtomValue } from 'jotai'

import { useIsSafeApp, useWalletInfo } from '@cowprotocol/wallet'

import { useComposableCowContract } from 'modules/advancedOrders/hooks/useComposableCowContract'
import { AppDataUpdater } from 'modules/appData'

import { CreatedInOrderBookOrdersUpdater } from './CreatedInOrderBookOrdersUpdater'
import { FallbackHandlerVerificationUpdater } from './FallbackHandlerVerificationUpdater'
import { FullAmountQuoteUpdater } from './FullAmountQuoteUpdater'
import { PartOrdersUpdater } from './PartOrdersUpdater'
import { QuoteObserverUpdater } from './QuoteObserverUpdater'
import { QuoteParamsUpdater } from './QuoteParamsUpdater'
import { TwapAmountsFromUrlsUpdater } from './TwapAmountsFromUrlsUpdater'
import { TwapOrdersUpdater } from './TwapOrdersUpdater'

import { twapOrderSlippageAtom } from '../state/twapOrdersSettingsAtom'

export function TwapUpdaters() {
  const { chainId, account } = useWalletInfo()
  const isSafeApp = useIsSafeApp()
  const composableCowContract = useComposableCowContract()
  const twapOrderSlippage = useAtomValue(twapOrderSlippageAtom)

  const shouldLoadTwapOrders = !!(isSafeApp && chainId && account && composableCowContract)

  return (
    <>
      <CreatedInOrderBookOrdersUpdater />
      <QuoteParamsUpdater />
      <AppDataUpdater orderClass="twap" slippage={twapOrderSlippage} />
      <QuoteObserverUpdater />
      <TwapAmountsFromUrlsUpdater />
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
