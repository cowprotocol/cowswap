import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { useIsSafeApp, useWalletInfo } from '@cowprotocol/wallet'

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
  const isSafeApp = useIsSafeApp()

  return useMemo(() => {
    return getTwapFormState({
      isSafeApp,
      verification,
      twapOrder,
      sellAmountPartFiat,
      chainId,
      partTime,
    })
  }, [isSafeApp, verification, twapOrder, sellAmountPartFiat, chainId, partTime])
}
