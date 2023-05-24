import { atom } from 'jotai'
import { advancedOrdersDerivedStateAtom } from '../../advancedOrders'
import { CurrencyAmount, Percent, Token } from '@uniswap/sdk-core'
import { TWAPOrder } from '../types'
import { walletInfoAtom } from '../../wallet/api/state'
import { twapOrdersSettingsAtom } from './twapOrdersSettingsAtom'
import { DEFAULT_TWAP_SLIPPAGE } from '../const'

export const twapTimeIntervalAtom = atom<number>((get) => {
  const { isCustomDeadline, customDeadline, deadline } = get(twapOrdersSettingsAtom)

  return isCustomDeadline ? (customDeadline.hours * 60 + customDeadline.minutes) * 6 : Math.round(deadline / 1000)
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
