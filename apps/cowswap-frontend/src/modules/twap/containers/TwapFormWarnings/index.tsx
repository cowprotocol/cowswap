import { useAtomValue, useSetAtom } from 'jotai'
import { ReactNode, useCallback } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Percent } from '@cowprotocol/currency'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useAdvancedOrdersDerivedState } from 'modules/advancedOrders'
import { useTradeRouteContext } from 'modules/trade/hooks/useTradeRouteContext'
import { useGetTradeFormValidation } from 'modules/tradeFormValidation'
import { TradeFormValidation } from 'modules/tradeFormValidation/types'
import { SellNativeWarningBanner } from 'modules/tradeWidgetAddons'

import {
  FallbackHandlerWarning,
  ReceiveZeroFromNetworkCostsWarning,
  SmallPartTimeWarning,
  SmallPartVolumeWarning,
  UnsupportedWalletWarning,
} from './warnings'
import { BigPartTimeWarning } from './warnings/BigPartTimeWarning'
import { SmallPriceProtectionWarning } from './warnings/SmallPriceProtectionWarning'
import { SwapPriceDifferenceWarning } from './warnings/SwapPriceDifferenceWarning'

import { getHasTwapFormInput, getTwapSellAmountUsdBucket } from '../../analytics/twapDemandAnalytics.utils'
import { useIsFallbackHandlerRequired } from '../../hooks/useFallbackHandlerVerification'
import { useSwapAmountDifference } from '../../hooks/useSwapAmountDifference'
import { useTwapDemandAnalytics } from '../../hooks/useTwapDemandAnalytics'
import { useTwapSlippage } from '../../hooks/useTwapSlippage'
import { useTwapSwapSuggestion } from '../../hooks/useTwapSwapSuggestion'
import { useTwapWarningsContext } from '../../hooks/useTwapWarningsContext'
import { TwapFormState } from '../../pure/PrimaryActionButton/getTwapFormState'
import { twapDeadlineAtom } from '../../state/twapOrderAtom'
import { twapOrdersSettingsAtom, updateTwapOrdersSettingsAtom } from '../../state/twapOrdersSettingsAtom'
import { isPriceProtectionNotEnough } from '../../utils/isPriceProtectionNotEnough'

interface QuoteWarningsParams {
  showFallbackHandlerWarning: boolean
  showSwapSuggestion: boolean
  isFallbackHandlerSetupAccepted: boolean
  swapPriceDifferenceWarning: ReactNode
  toggleFallbackHandlerSetupFlag: (isFallbackHandlerSetupAccepted: boolean) => void
  showTradeFormWarnings: boolean
  deadline: number
  slippage: Percent
}

interface TwapFormWarningsProps {
  localFormValidation: TwapFormState | null
  isConfirmationModal?: boolean
}

export function TwapFormWarnings({ localFormValidation, isConfirmationModal }: TwapFormWarningsProps): ReactNode {
  const { isFallbackHandlerSetupAccepted } = useAtomValue(twapOrdersSettingsAtom)
  const updateTwapOrdersSettings = useSetAtom(updateTwapOrdersSettingsAtom)
  const slippage = useTwapSlippage()
  const deadline = useAtomValue(twapDeadlineAtom)
  const swapAmountDifference = useSwapAmountDifference()
  const { suggestion, feeFiatAmount } = useTwapSwapSuggestion()
  const primaryFormValidation = useGetTradeFormValidation()

  const { chainId, account } = useWalletInfo()
  const isFallbackHandlerRequired = useIsFallbackHandlerRequired()
  const { canTrade, walletIsNotConnected } = useTwapWarningsContext()
  const tradeUrlParams = useTradeRouteContext()
  const { inputCurrencyAmount, outputCurrencyAmount, inputCurrencyFiatAmount } = useAdvancedOrdersDerivedState()
  const {
    isInterestButtonVisible,
    isInterestRegistered,
    isSafeViaWc,
    trackInterestClick,
    trackSafeWcBannerClick,
    trackSafeWcBannerShown,
    trackSetupLinkClick,
    trackUnsupportedWalletShown,
  } = useTwapDemandAnalytics()

  const hasFormInput = getHasTwapFormInput(inputCurrencyAmount, outputCurrencyAmount)
  const sellAmountUsdBucket = getTwapSellAmountUsdBucket(inputCurrencyFiatAmount)

  const toggleFallbackHandlerSetupFlag = useCallback(
    (isFallbackHandlerSetupAccepted: boolean) => {
      updateTwapOrdersSettings({ isFallbackHandlerSetupAccepted })
    },
    [updateTwapOrdersSettings],
  )

  const handleUnsupportedWalletShown = useCallback(() => {
    trackUnsupportedWalletShown({ hasFormInput, sellAmountUsdBucket })
  }, [hasFormInput, sellAmountUsdBucket, trackUnsupportedWalletShown])

  const handleInterestClick = useCallback(() => {
    trackInterestClick({ sellAmountUsdBucket })
  }, [sellAmountUsdBucket, trackInterestClick])

  const showTradeFormWarnings = !isConfirmationModal && canTrade
  const showFallbackHandlerWarning = showTradeFormWarnings && isFallbackHandlerRequired
  const showSwapSuggestion = suggestion !== null

  // Don't display any warnings while a wallet is not connected
  if (walletIsNotConnected) return null

  const swapPriceDifferenceWarning = (suggestion || swapAmountDifference) && (
    <SwapPriceDifferenceWarning
      tradeUrlParams={tradeUrlParams}
      feeFiatAmount={feeFiatAmount}
      suggestion={suggestion}
      swapAmountDifference={swapAmountDifference}
    />
  )

  return (
    <>
      {(() => {
        if (isUnsupportedWallet(localFormValidation)) {
          return (
            <UnsupportedWalletWarning
              isSafeViaWc={isSafeViaWc}
              chainId={chainId}
              account={account}
              isInterestButtonVisible={isInterestButtonVisible}
              isInterestRegistered={isInterestRegistered}
              onInterestClick={handleInterestClick}
              onSafeWcBannerClick={trackSafeWcBannerClick}
              onSafeWcBannerShown={trackSafeWcBannerShown}
              onSetupLinkClick={trackSetupLinkClick}
              onUnsupportedWalletShown={handleUnsupportedWalletShown}
            />
          )
        }

        if (primaryFormValidation === TradeFormValidation.SellNativeToken) {
          return <SellNativeWarningBanner />
        }

        const sellSizeWarning = renderSellSizeWarning(localFormValidation, chainId)
        if (sellSizeWarning) return sellSizeWarning

        if (localFormValidation === TwapFormState.PART_TIME_INTERVAL_TOO_SHORT) {
          return <SmallPartTimeWarning />
        }

        if (localFormValidation === TwapFormState.PART_TIME_INTERVAL_TOO_LONG) {
          return <BigPartTimeWarning />
        }

        return renderQuoteWarnings({
          showFallbackHandlerWarning,
          showSwapSuggestion,
          isFallbackHandlerSetupAccepted,
          swapPriceDifferenceWarning,
          toggleFallbackHandlerSetupFlag,
          showTradeFormWarnings,
          deadline,
          slippage,
        })
      })()}
    </>
  )
}

function isUnsupportedWallet(state: TwapFormState | null): boolean {
  return state === TwapFormState.WALLET_NOT_SUPPORTED || state === TwapFormState.TX_BUNDLING_NOT_SUPPORTED
}

function renderQuoteWarnings({
  showFallbackHandlerWarning,
  showSwapSuggestion,
  isFallbackHandlerSetupAccepted,
  swapPriceDifferenceWarning,
  toggleFallbackHandlerSetupFlag,
  showTradeFormWarnings,
  deadline,
  slippage,
}: QuoteWarningsParams): ReactNode {
  if (showFallbackHandlerWarning) {
    return (
      <>
        {(showSwapSuggestion || isFallbackHandlerSetupAccepted) && swapPriceDifferenceWarning}
        <FallbackHandlerWarning
          isFallbackHandlerSetupAccepted={isFallbackHandlerSetupAccepted}
          toggleFallbackHandlerSetupFlag={toggleFallbackHandlerSetupFlag}
        />
      </>
    )
  }

  return (
    <>
      {showTradeFormWarnings && !showSwapSuggestion && isPriceProtectionNotEnough(deadline, slippage) && (
        <SmallPriceProtectionWarning />
      )}
      {swapPriceDifferenceWarning}
    </>
  )
}

function renderSellSizeWarning(state: TwapFormState | null, chainId: SupportedChainId): ReactNode | null {
  if (state === TwapFormState.SELL_AMOUNT_TOO_SMALL) {
    return <SmallPartVolumeWarning chainId={chainId} />
  }

  if (state === TwapFormState.RECEIVE_ZERO_FROM_NETWORK_COSTS) {
    return <ReceiveZeroFromNetworkCostsWarning />
  }

  return null
}
