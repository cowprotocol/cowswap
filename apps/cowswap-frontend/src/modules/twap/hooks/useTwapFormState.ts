import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { isEoaAtom, isSafeAppAtom, useIsTxBundlingSupported, useWalletInfo } from '@cowprotocol/wallet'

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
  const isEoa = useAtomValue(isEoaAtom)
  const isTxBundlingSupported = useIsTxBundlingSupported()

  return getTwapFormState({
    isTxBundlingSupported,
    verification,
    sellAmountPartFiat,
    chainId,
    partTime,
    tradeFormValidationContext,
    numberOfPartsValue,
    isTwapEoaEnabled: !!isTwapEoaEnabled,
    isSafeApp,
    isEoa,
    isReceiveZeroFromNetworkCosts: isReceiveZeroFromNetworkCosts(receiveAmountInfo),
  })
}
