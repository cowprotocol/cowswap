import { useAtomValue } from 'jotai'

import { useIsSafeApp, useIsWalletConnect, useWalletCapabilities, useWalletInfo } from '@cowprotocol/wallet'

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
  const isWalletConnect = useIsWalletConnect()
  const walletCapabilities = useWalletCapabilities()

  // TODO: fix the condition in order to check whether is it a Safe via WC
  const isSafeWithBundlingTx = isSafeApp || Boolean(isWalletConnect && walletCapabilities?.atomicBatch?.supported)

  return getTwapFormState({
    isSafeWithBundlingTx,
    verification,
    twapOrder,
    sellAmountPartFiat,
    chainId,
    partTime,
  })
}
