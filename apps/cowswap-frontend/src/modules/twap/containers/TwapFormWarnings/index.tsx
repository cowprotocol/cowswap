import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { modifySafeHandlerAnalytics } from '@cowprotocol/analytics'
import { BundleTxApprovalBanner } from '@cowprotocol/ui'
import { useIsSafeViaWc, useWalletInfo } from '@cowprotocol/wallet'

import { useAdvancedOrdersDerivedState } from 'modules/advancedOrders'
import { SellNativeWarningBanner } from 'modules/trade/containers/SellNativeWarningBanner'
import { useTradeRouteContext } from 'modules/trade/hooks/useTradeRouteContext'
import { NoImpactWarning } from 'modules/trade/pure/NoImpactWarning'
import { TradeFormValidation, useGetTradeFormValidation } from 'modules/tradeFormValidation'
import { useTradeQuoteFeeFiatAmount } from 'modules/tradeQuote'
import { useShouldZeroApprove } from 'modules/zeroApproval'

import { ZeroApprovalWarning } from 'common/pure/ZeroApprovalWarning'

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
import { useTwapWarningsContext } from '../../hooks/useTwapWarningsContext'
import { TwapFormState } from '../../pure/PrimaryActionButton/getTwapFormState'
import { swapAmountDifferenceAtom } from '../../state/swapAmountDifferenceAtom'
import { twapDeadlineAtom, twapOrderAtom } from '../../state/twapOrderAtom'
import {
  twapOrderSlippageAtom,
  twapOrdersSettingsAtom,
  updateTwapOrdersSettingsAtom,
} from '../../state/twapOrdersSettingsAtom'
import { isPriceProtectionNotEnough } from '../../utils/isPriceProtectionNotEnough'

const BUNDLE_APPROVAL_STATES = [TradeFormValidation.ApproveAndSwap]

interface TwapFormWarningsProps {
  localFormValidation: TwapFormState | null
  isConfirmationModal?: boolean
}

export function TwapFormWarnings({ localFormValidation, isConfirmationModal }: TwapFormWarningsProps) {
  const { isFallbackHandlerSetupAccepted, isPriceImpactAccepted } = useAtomValue(twapOrdersSettingsAtom)
  const updateTwapOrdersSettings = useSetAtom(updateTwapOrdersSettingsAtom)
  const twapOrder = useAtomValue(twapOrderAtom)
  const slippage = useAtomValue(twapOrderSlippageAtom)
  const deadline = useAtomValue(twapDeadlineAtom)
  const swapAmountDifference = useAtomValue(swapAmountDifferenceAtom)
  const { outputCurrencyAmount } = useAdvancedOrdersDerivedState()
  const primaryFormValidation = useGetTradeFormValidation()

  const { chainId } = useWalletInfo()
  const isFallbackHandlerRequired = useIsFallbackHandlerRequired()
  const isSafeViaWc = useIsSafeViaWc()
  const tradeQuoteFeeFiatAmount = useTradeQuoteFeeFiatAmount()
  const { canTrade, showPriceImpactWarning, walletIsNotConnected } = useTwapWarningsContext()
  const tradeUrlParams = useTradeRouteContext()

  const toggleFallbackHandlerSetupFlag = useCallback(
    (isFallbackHandlerSetupAccepted: boolean) => {
      modifySafeHandlerAnalytics(isFallbackHandlerSetupAccepted ? 'enabled' : 'disabled')
      updateTwapOrdersSettings({ isFallbackHandlerSetupAccepted })
    },
    [updateTwapOrdersSettings]
  )

  const shouldZeroApprove = useShouldZeroApprove(twapOrder?.sellAmount)
  const showZeroApprovalWarning = !isConfirmationModal && shouldZeroApprove && outputCurrencyAmount !== null
  const showApprovalBundlingBanner =
    !isConfirmationModal && primaryFormValidation && BUNDLE_APPROVAL_STATES.includes(primaryFormValidation)
  const showTradeFormWarnings = !isConfirmationModal && canTrade
  const showFallbackHandlerWarning = showTradeFormWarnings && isFallbackHandlerRequired

  const setIsPriceImpactAccepted = useCallback(() => {
    updateTwapOrdersSettings({ isPriceImpactAccepted: !isPriceImpactAccepted })
  }, [updateTwapOrdersSettings, isPriceImpactAccepted])

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
      {showZeroApprovalWarning && <ZeroApprovalWarning currency={twapOrder?.sellAmount?.currency} />}
      {showApprovalBundlingBanner && <BundleTxApprovalBanner />}

      {!isConfirmationModal && showPriceImpactWarning && (
        <NoImpactWarning
          withoutAccepting={false}
          isAccepted={isPriceImpactAccepted}
          acceptCallback={() => setIsPriceImpactAccepted()}
        />
      )}

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
          return [
            isFallbackHandlerSetupAccepted ? swapPriceDifferenceWarning : null,
            <FallbackHandlerWarning
              isFallbackHandlerSetupAccepted={isFallbackHandlerSetupAccepted}
              toggleFallbackHandlerSetupFlag={toggleFallbackHandlerSetupFlag}
            />,
          ]
        }

        return [
          showTradeFormWarnings && isPriceProtectionNotEnough(deadline, slippage) ? (
            <SmallPriceProtectionWarning />
          ) : null,
          swapPriceDifferenceWarning,
        ]
      })()}
    </>
  )
}
