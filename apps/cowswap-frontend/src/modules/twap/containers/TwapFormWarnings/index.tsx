import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { useIsSafeViaWc, useWalletInfo } from '@cowprotocol/wallet'

import { modifySafeHandlerAnalytics } from 'modules/analytics'
import { SellNativeWarningBanner } from 'modules/trade/containers/SellNativeWarningBanner'
import { useTradeRouteContext } from 'modules/trade/hooks/useTradeRouteContext'
import { useGetTradeFormValidation } from 'modules/tradeFormValidation'
import { TradeFormValidation } from 'modules/tradeFormValidation/types'
import { useTradeQuoteFeeFiatAmount } from 'modules/tradeQuote'

import {
  FallbackHandlerWarning,
  SmallPartTimeWarning,
  SmallPartVolumeWarning,
  UnsupportedWalletWarning,
} from './warnings'
import { BigPartTimeWarning } from './warnings/BigPartTimeWarning'
import { SmallPriceProtectionWarning } from './warnings/SmallPriceProtectionWarning'
import { SwapPriceDifferenceWarning } from './warnings/SwapPriceDifferenceWarning'

import { useIsFallbackHandlerRequired } from '../../hooks/useFallbackHandlerVerification'
import { useTwapSlippage } from '../../hooks/useTwapSlippage'
import { useTwapWarningsContext } from '../../hooks/useTwapWarningsContext'
import { TwapFormState } from '../../pure/PrimaryActionButton/getTwapFormState'
import { swapAmountDifferenceAtom } from '../../state/swapAmountDifferenceAtom'
import { twapDeadlineAtom } from '../../state/twapOrderAtom'
import { twapOrdersSettingsAtom, updateTwapOrdersSettingsAtom } from '../../state/twapOrdersSettingsAtom'
import { isPriceProtectionNotEnough } from '../../utils/isPriceProtectionNotEnough'

interface TwapFormWarningsProps {
  localFormValidation: TwapFormState | null
  isConfirmationModal?: boolean
}

export function TwapFormWarnings({ localFormValidation, isConfirmationModal }: TwapFormWarningsProps) {
  const { isFallbackHandlerSetupAccepted } = useAtomValue(twapOrdersSettingsAtom)
  const updateTwapOrdersSettings = useSetAtom(updateTwapOrdersSettingsAtom)
  const slippage = useTwapSlippage()
  const deadline = useAtomValue(twapDeadlineAtom)
  const swapAmountDifference = useAtomValue(swapAmountDifferenceAtom)
  const primaryFormValidation = useGetTradeFormValidation()

  const { chainId } = useWalletInfo()
  const isFallbackHandlerRequired = useIsFallbackHandlerRequired()
  const isSafeViaWc = useIsSafeViaWc()
  const tradeQuoteFeeFiatAmount = useTradeQuoteFeeFiatAmount()
  const { canTrade, walletIsNotConnected } = useTwapWarningsContext()
  const tradeUrlParams = useTradeRouteContext()

  const toggleFallbackHandlerSetupFlag = useCallback(
    (isFallbackHandlerSetupAccepted: boolean) => {
      modifySafeHandlerAnalytics(isFallbackHandlerSetupAccepted ? 'enabled' : 'disabled')
      updateTwapOrdersSettings({ isFallbackHandlerSetupAccepted })
    },
    [updateTwapOrdersSettings],
  )

  const showTradeFormWarnings = !isConfirmationModal && canTrade
  const showFallbackHandlerWarning = showTradeFormWarnings && isFallbackHandlerRequired

  // Don't display any warnings while a wallet is not connected
  if (walletIsNotConnected) return null

  const swapPriceDifferenceWarning = swapAmountDifference ? (
    <SwapPriceDifferenceWarning
      tradeUrlParams={tradeUrlParams}
      feeFiatAmount={tradeQuoteFeeFiatAmount}
      swapAmountDifference={swapAmountDifference}
    />
  ) : null

  return (
    <>
      {(() => {
        if (localFormValidation === TwapFormState.NOT_SAFE) {
          return <UnsupportedWalletWarning isSafeViaWc={isSafeViaWc} />
        }

        if (primaryFormValidation === TradeFormValidation.SellNativeToken) {
          return <SellNativeWarningBanner />
        }

        if (localFormValidation === TwapFormState.SELL_AMOUNT_TOO_SMALL) {
          return <SmallPartVolumeWarning chainId={chainId} />
        }

        if (localFormValidation === TwapFormState.PART_TIME_INTERVAL_TOO_SHORT) {
          return <SmallPartTimeWarning />
        }

        if (localFormValidation === TwapFormState.PART_TIME_INTERVAL_TOO_LONG) {
          return <BigPartTimeWarning />
        }

        if (showFallbackHandlerWarning) {
          return (
            <>
              {isFallbackHandlerSetupAccepted && swapPriceDifferenceWarning}
              <FallbackHandlerWarning
                isFallbackHandlerSetupAccepted={isFallbackHandlerSetupAccepted}
                toggleFallbackHandlerSetupFlag={toggleFallbackHandlerSetupFlag}
              />
            </>
          )
        }

        return (
          <>
            {showTradeFormWarnings && isPriceProtectionNotEnough(deadline, slippage) && <SmallPriceProtectionWarning />}
            {swapPriceDifferenceWarning}
          </>
        )
      })()}
    </>
  )
}
