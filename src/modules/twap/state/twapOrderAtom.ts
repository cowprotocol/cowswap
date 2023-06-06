import { atom } from 'jotai'

import { CurrencyAmount, Percent, Token } from '@uniswap/sdk-core'

import { twapOrdersSettingsAtom } from './twapOrdersSettingsAtom'

import { advancedOrdersDerivedStateAtom } from '../../advancedOrders'
import { walletInfoAtom } from '../../wallet/api/state'
import { DEFAULT_TWAP_SLIPPAGE } from '../const'
import { TWAPOrder } from '../types'
import { customDeadlineToSeconds } from '../utils/deadlinePartsDisplay'

export const twapTimeIntervalAtom = atom<number>((get) => {
  const { numberOfPartsValue, isCustomDeadline, customDeadline, deadline } = get(twapOrdersSettingsAtom)
  const seconds = isCustomDeadline ? customDeadlineToSeconds(customDeadline) : deadline / 1000

  return seconds / numberOfPartsValue
})

export const twapOrderAtom = atom<TWAPOrder | null>((get) => {
  const { account } = get(walletInfoAtom)
  const { numberOfPartsValue, slippageValue } = get(twapOrdersSettingsAtom)
  const timeInterval = get(twapTimeIntervalAtom)
  const { inputCurrencyAmount, outputCurrencyAmount, recipient } = get(advancedOrdersDerivedStateAtom)

  if (!inputCurrencyAmount || !outputCurrencyAmount || !account) return null

  const slippage =
    slippageValue != null
      ? // Multiplying on 100 to allow decimals values (e.g 0.05)
        new Percent(slippageValue * 100, 10000)
      : DEFAULT_TWAP_SLIPPAGE
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
