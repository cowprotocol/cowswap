import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { walletInfoAtom } from '@cowprotocol/wallet'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { advancedOrdersDerivedStateAtom } from 'modules/advancedOrders'
import { getAppData } from 'modules/appData'
import { appDataInfoAtom } from 'modules/appData/state/atoms'

import { useScaledReceiveAmountInfo } from './useScaledReceiveAmountInfo'

import { twapTimeIntervalAtom } from '../state/twapOrderAtom'
import { twapOrdersSettingsAtom } from '../state/twapOrdersSettingsAtom'
import { TWAPOrder } from '../types'

export function useTwapOrder(): TWAPOrder | null {
  const appDataInfo = useAtomValue(appDataInfoAtom)
  const { account } = useAtomValue(walletInfoAtom)
  const { numberOfPartsValue } = useAtomValue(twapOrdersSettingsAtom)
  const timeInterval = useAtomValue(twapTimeIntervalAtom)
  const { inputCurrencyAmount, recipient, recipientAddress } = useAtomValue(advancedOrdersDerivedStateAtom)
  const receiveAmountInfo = useScaledReceiveAmountInfo()

  return useMemo(() => {
    if (!inputCurrencyAmount || !receiveAmountInfo) return null

    const { sellAmount, buyAmount } = receiveAmountInfo.afterSlippage

    return {
      sellAmount: sellAmount as CurrencyAmount<Token>,
      buyAmount: buyAmount as CurrencyAmount<Token>,
      receiver: recipientAddress || recipient || account || '',
      numOfParts: numberOfPartsValue,
      startTime: 0, // Will be set to a block timestamp value from CurrentBlockTimestampFactory
      timeInterval,
      span: 0,
      appData: appDataInfo?.appDataKeccak256 || getAppData().appDataKeccak256,
    }
  }, [
    appDataInfo,
    account,
    inputCurrencyAmount,
    numberOfPartsValue,
    receiveAmountInfo,
    recipient,
    recipientAddress,
    timeInterval,
  ])
}
