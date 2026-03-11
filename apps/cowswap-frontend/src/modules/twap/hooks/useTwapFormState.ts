import { useAtomValue } from 'jotai'

import { useIsSafeWallet, useIsTxBundlingSupported, useWalletInfo } from '@cowprotocol/wallet'

import { useAdvancedOrdersDerivedState } from 'modules/advancedOrders'
import { useUsdAmount } from 'modules/usdAmount'

import { useFallbackHandlerVerification } from './useFallbackHandlerVerification'
import { useIsTwapEoaPrototypeEnabled } from './useIsTwapEoaPrototypeEnabled'
import { useTwapOrder } from './useTwapOrder'

import { getTwapFormState, TwapFormState } from '../pure/PrimaryActionButton/getTwapFormState'
import { twapTimeIntervalAtom } from '../state/twapOrderAtom'
import { twapOrdersSettingsAtom } from '../state/twapOrdersSettingsAtom'

export function useTwapFormState(): TwapFormState | null {
  const { chainId } = useWalletInfo()
  const twapOrder = useTwapOrder()
  const { inputCurrencyAmount } = useAdvancedOrdersDerivedState()
  const { numberOfPartsValue } = useAtomValue(twapOrdersSettingsAtom)
  const inputPartAmount = inputCurrencyAmount?.divide(numberOfPartsValue)
  const sellAmountPartFiat = useUsdAmount(inputPartAmount).value

  const partTime = useAtomValue(twapTimeIntervalAtom)

  const verification = useFallbackHandlerVerification()
  const isSafeWallet = useIsSafeWallet()
  const isTwapEoaPrototypeEnabled = useIsTwapEoaPrototypeEnabled()
  const isTxBundlingSupported = useIsTxBundlingSupported()
  const skipSafeChecks = isTwapEoaPrototypeEnabled && !isSafeWallet

  return getTwapFormState({
    isTxBundlingSupported,
    verification,
    twapOrder,
    sellAmountPartFiat,
    chainId,
    partTime,
    skipSafeChecks,
  })
}
