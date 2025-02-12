import { useAtomValue } from 'jotai'

import { useIsTxBundlingSupported, useWalletInfo } from '@cowprotocol/wallet'

import { useReceiveAmountInfo } from 'modules/trade'
import { useUsdAmount } from 'modules/usdAmount'

import { useFallbackHandlerVerification } from './useFallbackHandlerVerification'

import { getTwapFormState, TwapFormState } from '../pure/PrimaryActionButton/getTwapFormState'
import { twapOrderAtom, twapTimeIntervalAtom } from '../state/twapOrderAtom'

export function useTwapFormState(): TwapFormState | null {
  const { chainId } = useWalletInfo()
  const twapOrder = useAtomValue(twapOrderAtom)

  const receiveAmountInfo = useReceiveAmountInfo()
  const { sellAmount } = receiveAmountInfo?.afterPartnerFees || {}
  const sellAmountPartFiat = useUsdAmount(sellAmount).value

  const partTime = useAtomValue(twapTimeIntervalAtom)

  const verification = useFallbackHandlerVerification()
  const isTxBundlingSupported = useIsTxBundlingSupported()

  return getTwapFormState({
    isTxBundlingSupported,
    verification,
    twapOrder,
    sellAmountPartFiat,
    chainId,
    partTime,
  })
}
