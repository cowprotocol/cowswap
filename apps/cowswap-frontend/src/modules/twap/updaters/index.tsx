import { ReactNode } from 'react'

import { TradeSpenderOverrideUpdater } from '@cowprotocol/balances-and-allowances'
import { percentToBps, COW_PROTOCOL_VAULT_RELAYER_ADDRESS } from '@cowprotocol/common-utils'
import { useIsSafeWallet, useWalletInfo } from '@cowprotocol/wallet'

import { useComposableCowContractData } from 'modules/advancedOrders/hooks/useComposableCowContract'
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
  const composableCowContract = useComposableCowContractData()
  const twapOrderSlippage = useTwapSlippage()

  const shouldLoadTwapOrders = !!(isSafeWallet && account && composableCowContract.address)
  const composableCowChainId = composableCowContract.chainId
  // TWAP orders always approve against the production vault relayer regardless of the current environment.
  const spenderAddress = chainId ? COW_PROTOCOL_VAULT_RELAYER_ADDRESS[chainId] : undefined

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
