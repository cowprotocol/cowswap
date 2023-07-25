import { useAtomValue } from 'jotai'
import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { modifySafeHandlerAnalytics } from 'legacy/components/analytics/events/twapEvents'

import { NoImpactWarning } from 'modules/trade/pure/NoImpactWarning'
import { useIsSafeViaWc, useWalletInfo } from 'modules/wallet'

import { useShouldZeroApprove } from 'common/hooks/useShouldZeroApprove'
import { BundleTxApprovalBanner } from 'common/pure/InlineBanner/banners'
import { ZeroApprovalWarning } from 'common/pure/ZeroApprovalWarning'

import {
  FallbackHandlerWarning,
  SmallPartTimeWarning,
  SmallPartVolumeWarning,
  UnsupportedWalletWarning,
} from './warnings'
import { SmallPriceProtectionWarning } from './warnings/SmallPriceProtectionWarning'

import { useAdvancedOrdersDerivedState } from '../../../advancedOrders'
import { TradeFormValidation, useGetTradeFormValidation } from '../../../tradeFormValidation'
import { useIsFallbackHandlerRequired } from '../../hooks/useFallbackHandlerVerification'
import { useTwapWarningsContext } from '../../hooks/useTwapWarningsContext'
import { TwapFormState } from '../../pure/PrimaryActionButton/getTwapFormState'
import { twapDeadlineAtom, twapOrderAtom } from '../../state/twapOrderAtom'
import {
  twapOrderSlippageAtom,
  twapOrdersSettingsAtom,
  updateTwapOrdersSettingsAtom,
} from '../../state/twapOrdersSettingsAtom'
import { isPriceProtectionNotEnough } from '../../utils/isPriceProtectionNotEnough'

const BUNDLE_APPROVAL_STATES = [TradeFormValidation.ApproveAndSwap, TradeFormValidation.ExpertApproveAndSwap]

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
  const { outputCurrencyAmount } = useAdvancedOrdersDerivedState()
  const primaryFormValidation = useGetTradeFormValidation()

  const { chainId } = useWalletInfo()
  const isFallbackHandlerRequired = useIsFallbackHandlerRequired()
  const isSafeViaWc = useIsSafeViaWc()
  const { canTrade, showPriceImpactWarning, walletIsNotConnected } = useTwapWarningsContext()

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

        if (chainId && localFormValidation === TwapFormState.SELL_AMOUNT_TOO_SMALL) {
          return <SmallPartVolumeWarning chainId={chainId} />
        }

        if (localFormValidation === TwapFormState.PART_TIME_INTERVAL_TOO_SHORT) {
          return <SmallPartTimeWarning />
        }

        if (showFallbackHandlerWarning) {
          return (
            <FallbackHandlerWarning
              isFallbackHandlerSetupAccepted={isFallbackHandlerSetupAccepted}
              toggleFallbackHandlerSetupFlag={toggleFallbackHandlerSetupFlag}
            />
          )
        }

        if (showTradeFormWarnings && isPriceProtectionNotEnough(deadline, slippage)) {
          return <SmallPriceProtectionWarning />
        }

        return null
      })()}
    </>
  )
}
