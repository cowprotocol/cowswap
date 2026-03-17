import { ReactNode } from 'react'

import { TradeSpenderOverrideUpdater } from '@cowprotocol/balances-and-allowances'
import { percentToBps } from '@cowprotocol/common-utils'
import { COW_PROTOCOL_VAULT_RELAYER_ADDRESS } from '@cowprotocol/cow-sdk'
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

export function TwapUpdaters(): ReactNode {
  const { chainId, account } = useWalletInfo()
  const isSafeWallet = useIsSafeWallet()
  const { contract: composableCowContract, chainId: composableCowChainId } = useComposableCowContract()
  const twapOrderSlippage = useTwapSlippage()

  const shouldLoadTwapOrders = !!(isSafeWallet && account && composableCowContract)
  // TWAP orders always approve against the production vault relayer regardless of the current environment.
  const spenderAddress = COW_PROTOCOL_VAULT_RELAYER_ADDRESS[chainId]

  return (
    <>
      <TradeSpenderOverrideUpdater spenderAddress={spenderAddress} />
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
