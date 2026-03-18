import { useAtomValue, useSetAtom } from 'jotai'
import { ReactNode, useCallback } from 'react'

import { Percent } from '@cowprotocol/currency'
import { useIsSafeViaWc, useIsSmartContractWallet, useWalletInfo } from '@cowprotocol/wallet'

import { useTradeRouteContext } from 'modules/trade'
import { TradeFormValidation, useGetTradeFormValidation } from 'modules/tradeFormValidation'
import { useTradeQuoteFeeFiatAmount } from 'modules/tradeQuote'
import { SellNativeWarningBanner } from 'modules/tradeWidgetAddons'

import {
  FallbackHandlerWarning,
  SmallPartTimeWarning,
  SmallPartVolumeWarning,
  UnsupportedWalletWarning,
} from './warnings'
import { BigPartTimeWarning } from './warnings/BigPartTimeWarning'
import { SmallPriceProtectionWarning } from './warnings/SmallPriceProtectionWarning'
import { SwapPriceDifferenceWarning } from './warnings/SwapPriceDifferenceWarning'

import { DEFAULT_NUM_OF_PARTS } from '../../const'
import { useIsFallbackHandlerRequired } from '../../hooks/useFallbackHandlerVerification'
import { useMaxTwapPartsShortcut } from '../../hooks/useMaxTwapPartsShortcut'
import { useSwapAmountDifference } from '../../hooks/useSwapAmountDifference'
import { useTwapSlippage } from '../../hooks/useTwapSlippage'
import { useTwapWarningsContext } from '../../hooks/useTwapWarningsContext'
import { TwapFormState } from '../../pure/PrimaryActionButton/getTwapFormState'
import { twapDeadlineAtom } from '../../state/twapOrderAtom'
import { twapOrdersSettingsAtom, updateTwapOrdersSettingsAtom } from '../../state/twapOrdersSettingsAtom'
import { isPriceProtectionNotEnough } from '../../utils/isPriceProtectionNotEnough'

interface TwapFormWarningsProps {
  localFormValidation: TwapFormState | null
  isConfirmationModal?: boolean
}

interface TwapWarningsRendererParams {
  localFormValidation: TwapFormState | null
  primaryFormValidation: TradeFormValidation | null
  isSafeViaWc: boolean
  isSmartContractWallet: boolean | undefined
  chainId: ReturnType<typeof useWalletInfo>['chainId']
  account: ReturnType<typeof useWalletInfo>['account']
  isFallbackHandlerSetupAccepted: boolean
  toggleFallbackHandlerSetupFlag(isFallbackHandlerSetupAccepted: boolean): void
  showFallbackHandlerWarning: boolean
  showTradeFormWarnings: boolean
  isAtMinimumParts: boolean
  deadline: number
  slippage: Percent
  swapPriceDifferenceWarning: ReactNode
  maxValidParts: number
  canUseMaxPartsShortcut: boolean
  useMaxPartsShortcut(): void
}

export function TwapFormWarnings({ localFormValidation, isConfirmationModal }: TwapFormWarningsProps): ReactNode {
  const { isFallbackHandlerSetupAccepted, numberOfPartsValue } = useAtomValue(twapOrdersSettingsAtom)
  const isAtMinimumParts = numberOfPartsValue === DEFAULT_NUM_OF_PARTS
  const updateTwapOrdersSettings = useSetAtom(updateTwapOrdersSettingsAtom)
  const slippage = useTwapSlippage()
  const deadline = useAtomValue(twapDeadlineAtom)
  const swapAmountDifference = useSwapAmountDifference()
  const primaryFormValidation = useGetTradeFormValidation()

  const { chainId, account } = useWalletInfo()
  const isSmartContractWallet = useIsSmartContractWallet()
  const isFallbackHandlerRequired = useIsFallbackHandlerRequired()
  const tradeQuoteFeeFiatAmount = useTradeQuoteFeeFiatAmount()
  const { canTrade, walletIsNotConnected } = useTwapWarningsContext()
  const tradeUrlParams = useTradeRouteContext()
  const isSafeViaWc = useIsSafeViaWc()

  const toggleFallbackHandlerSetupFlag = useCallback(
    (isFallbackHandlerSetupAccepted: boolean) => {
      updateTwapOrdersSettings({ isFallbackHandlerSetupAccepted })
    },
    [updateTwapOrdersSettings],
  )

  const showTradeFormWarnings = !isConfirmationModal && canTrade
  const showFallbackHandlerWarning = showTradeFormWarnings && isFallbackHandlerRequired
  const { maxValidParts, canUseMaxPartsShortcut, useMaxPartsShortcut } = useMaxTwapPartsShortcut(isConfirmationModal)

  // Don't display any warnings while a wallet is not connected
  if (walletIsNotConnected) return null

  const swapPriceDifferenceWarning = swapAmountDifference ? (
    <SwapPriceDifferenceWarning
      tradeUrlParams={tradeUrlParams}
      feeFiatAmount={tradeQuoteFeeFiatAmount}
      swapAmountDifference={swapAmountDifference}
    />
  ) : null

  return getTwapWarningContent({
    localFormValidation,
    primaryFormValidation,
    isSafeViaWc,
    isSmartContractWallet,
    chainId,
    account,
    isFallbackHandlerSetupAccepted,
    toggleFallbackHandlerSetupFlag,
    showFallbackHandlerWarning,
    showTradeFormWarnings,
    isAtMinimumParts,
    deadline,
    slippage,
    swapPriceDifferenceWarning,
    maxValidParts,
    canUseMaxPartsShortcut,
    useMaxPartsShortcut,
  })
}

function getTwapWarningContent(params: TwapWarningsRendererParams): ReactNode {
  const {
    localFormValidation,
    primaryFormValidation,
    isSafeViaWc,
    isSmartContractWallet,
    chainId,
    account,
    isFallbackHandlerSetupAccepted,
    toggleFallbackHandlerSetupFlag,
    showFallbackHandlerWarning,
    showTradeFormWarnings,
    isAtMinimumParts,
    deadline,
    slippage,
    swapPriceDifferenceWarning,
    maxValidParts,
    canUseMaxPartsShortcut,
    useMaxPartsShortcut,
  } = params

  if (localFormValidation === TwapFormState.TX_BUNDLING_NOT_SUPPORTED) {
    return (
      <UnsupportedWalletWarning
        isSafeViaWc={isSafeViaWc}
        isSmartContractWallet={isSmartContractWallet}
        chainId={chainId}
        account={account}
      />
    )
  }

  if (primaryFormValidation === TradeFormValidation.SellNativeToken) {
    return <SellNativeWarningBanner />
  }

  if (localFormValidation === TwapFormState.SELL_AMOUNT_TOO_SMALL) {
    return (
      <SmallPartVolumeWarning
        chainId={chainId}
        isAtMinimumParts={isAtMinimumParts}
        maxPartsValue={canUseMaxPartsShortcut ? maxValidParts : undefined}
        onUseMaxParts={canUseMaxPartsShortcut ? useMaxPartsShortcut : undefined}
      />
    )
  }

  if (localFormValidation === TwapFormState.PART_TIME_INTERVAL_TOO_SHORT) {
    return (
      <SmallPartTimeWarning
        maxPartsValue={canUseMaxPartsShortcut ? maxValidParts : undefined}
        onUseMaxParts={canUseMaxPartsShortcut ? useMaxPartsShortcut : undefined}
      />
    )
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
}
