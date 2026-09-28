import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { isSafeAppAtom, isSafeViaWcAtom, useIsTxBundlingSupported, useWalletInfo } from '@cowprotocol/wallet'

import { useAdvancedOrdersDerivedState } from 'modules/advancedOrders'
import { useGetReceiveAmountInfo } from 'modules/trade'
import { tradeFormValidationContextAtom } from 'modules/tradeFormValidation'

import { useFallbackHandlerVerification } from './useFallbackHandlerVerification'

import { getTwapFormState, TwapFormState } from '../pure/PrimaryActionButton/getTwapFormState'
import { twapTimeIntervalAtom } from '../state/twapOrderAtom'
import { twapOrdersSettingsAtom } from '../state/twapOrdersSettingsAtom'
import { isReceiveZeroFromNetworkCosts } from '../utils/isReceiveZeroFromNetworkCosts'

export function useTwapFormState(): TwapFormState | null {
  const { chainId } = useWalletInfo()
  const { isTwapEoaEnabled } = useFeatureFlags()

  const receiveAmountInfo = useGetReceiveAmountInfo()
  const { inputCurrencyFiatAmount } = useAdvancedOrdersDerivedState()
  const partTime = useAtomValue(twapTimeIntervalAtom)
  const { numberOfPartsValue } = useAtomValue(twapOrdersSettingsAtom)
  const sellAmountPartFiat = useMemo(() => {
    if (!inputCurrencyFiatAmount || !Number.isInteger(numberOfPartsValue) || numberOfPartsValue < 1) return null

    return inputCurrencyFiatAmount.divide(numberOfPartsValue)
  }, [inputCurrencyFiatAmount, numberOfPartsValue])
  const tradeFormValidationContext = useAtomValue(tradeFormValidationContextAtom)

  const verification = useFallbackHandlerVerification()
  const isSafeApp = useAtomValue(isSafeAppAtom)
  const isSafeViaWc = useAtomValue(isSafeViaWcAtom)
  const isTxBundlingSupported = useIsTxBundlingSupported()
  // TODO: Replace these connection-based checks once isSafeWalletAtom distinguishes
  // loading from a confirmed non-Safe account.
  const isWalletSupported = isSafeApp === null || isSafeViaWc === null ? null : isSafeApp || isSafeViaWc

  return getTwapFormState({
    isWalletSupported,
    isTxBundlingSupported,
    verification,
    sellAmountPartFiat,
    chainId,
    partTime,
    tradeFormValidationContext,
    numberOfPartsValue,
    isTwapEoaEnabled: !!isTwapEoaEnabled,
    isSafeViaWc,
    isReceiveZeroFromNetworkCosts: isReceiveZeroFromNetworkCosts(receiveAmountInfo),
  })
}
