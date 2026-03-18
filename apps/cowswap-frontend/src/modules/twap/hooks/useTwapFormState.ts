import { useAtomValue } from 'jotai'

import { useIsSafeWallet, useIsTxBundlingSupported, useWalletInfo } from '@cowprotocol/wallet'

import { useGetReceiveAmountInfo } from 'modules/trade'
import { useUsdAmount } from 'modules/usdAmount'

import { useFallbackHandlerVerification } from './useFallbackHandlerVerification'
import { useIsTwapEoaPrototypeEnabled } from './useIsTwapEoaPrototypeEnabled'
import { useTwapOrder } from './useTwapOrder'

import { getTwapFormState, TwapFormState } from '../pure/PrimaryActionButton/getTwapFormState'
import { twapTimeIntervalAtom } from '../state/twapOrderAtom'

export function useTwapFormState(): TwapFormState | null {
  const { chainId } = useWalletInfo()
  const twapOrder = useTwapOrder()
  const receiveAmountInfo = useGetReceiveAmountInfo()
  const { sellAmount } = receiveAmountInfo?.beforeAllFees || {}
  const sellAmountPartFiat = useUsdAmount(sellAmount).value

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
