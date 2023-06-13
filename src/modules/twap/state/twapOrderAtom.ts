import { atom } from 'jotai'

import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { twapOrderSlippage, twapOrdersSettingsAtom } from './twapOrdersSettingsAtom'

import { advancedOrdersDerivedStateAtom } from '../../advancedOrders'
import { walletInfoAtom } from '../../wallet/api/state'
import { TWAPOrder } from '../types'
import { customDeadlineToSeconds } from '../utils/deadlinePartsDisplay'

export const twapTimeIntervalAtom = atom<number>((get) => {
  const { numberOfPartsValue, isCustomDeadline, customDeadline, deadline } = get(twapOrdersSettingsAtom)
  const seconds = isCustomDeadline ? customDeadlineToSeconds(customDeadline) : deadline / 1000

  return seconds / numberOfPartsValue
})

export const twapOrderAtom = atom<TWAPOrder | null>((get) => {
  const { account } = get(walletInfoAtom)
  const { numberOfPartsValue } = get(twapOrdersSettingsAtom)
  const timeInterval = get(twapTimeIntervalAtom)
  const { inputCurrencyAmount, outputCurrencyAmount, recipient } = get(advancedOrdersDerivedStateAtom)
  const slippage = get(twapOrderSlippage)

  if (!inputCurrencyAmount || !outputCurrencyAmount || !account) return null

  const slippageAmount = outputCurrencyAmount.multiply(slippage)
  const buyAmountWithSlippage = outputCurrencyAmount.subtract(slippageAmount)

  return {
    sellAmount: inputCurrencyAmount as CurrencyAmount<Token>,
    buyAmount: buyAmountWithSlippage as CurrencyAmount<Token>,
    receiver: recipient || account, // TODO: check case with ENS name
    numOfParts: numberOfPartsValue,
    startTime: 0, // Will be set just before an order creation
    timeInterval,
    span: 0,
  }
})
