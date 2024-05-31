import { atom } from 'jotai'

import { walletInfoAtom } from '@cowprotocol/wallet'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { advancedOrdersDerivedStateAtom } from 'modules/advancedOrders'
import { getAppData } from 'modules/appData'
import { appDataInfoAtom } from 'modules/appData/state/atoms'

import { partsStateAtom } from './partsStateAtom'
import { twapOrdersSettingsAtom } from './twapOrdersSettingsAtom'

import { TWAPOrder } from '../types'
import { customDeadlineToSeconds } from '../utils/deadlinePartsDisplay'

export const twapDeadlineAtom = atom<number>((get) => {
  const { isCustomDeadline, customDeadline, deadline } = get(twapOrdersSettingsAtom)

  return isCustomDeadline ? customDeadlineToSeconds(customDeadline) : deadline / 1000
})

export const twapTimeIntervalAtom = atom<number>((get) => {
  const { numberOfPartsValue } = get(twapOrdersSettingsAtom)
  const seconds = get(twapDeadlineAtom)

  return Math.ceil(seconds / numberOfPartsValue)
})

export const twapOrderAtom = atom<TWAPOrder | null>((get) => {
  const appDataInfo = get(appDataInfoAtom)
  const { account } = get(walletInfoAtom)
  const { numberOfPartsValue } = get(twapOrdersSettingsAtom)
  const timeInterval = get(twapTimeIntervalAtom)
  const { receiveAmountInfo } = get(partsStateAtom)
  const { inputCurrencyAmount, recipient, recipientAddress } = get(advancedOrdersDerivedStateAtom)

  if (!inputCurrencyAmount || !receiveAmountInfo || !account) return null

  const sellAmount = receiveAmountInfo.afterNetworkCosts.sellAmount
  const minReceived = receiveAmountInfo.afterSlippage.buyAmount

  return {
    sellAmount: sellAmount as CurrencyAmount<Token>,
    buyAmount: minReceived as CurrencyAmount<Token>,
    receiver: recipientAddress || recipient || account,
    numOfParts: numberOfPartsValue,
    startTime: 0, // Will be set to a block timestamp value from CurrentBlockTimestampFactory
    timeInterval,
    span: 0,
    appData: appDataInfo?.appDataKeccak256 || getAppData().appDataKeccak256,
  }
})
