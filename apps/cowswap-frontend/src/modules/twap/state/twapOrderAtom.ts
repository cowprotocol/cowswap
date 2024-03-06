import { atom } from 'jotai'

import { FractionUtils } from '@cowprotocol/common-utils'
import { walletInfoAtom } from '@cowprotocol/wallet'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

import { advancedOrdersDerivedStateAtom } from 'modules/advancedOrders'
import { getAppData } from 'modules/appData'
import { appDataInfoAtom } from 'modules/appData/state/atoms'

import { twapOrderSlippageAtom, twapOrdersSettingsAtom } from './twapOrdersSettingsAtom'

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

/**
 * Get slippage adjusted buyAmount for TWAP orders
 *
 * Calculated independently as we don't need the user to be connected to know how much they would receive
 */
export const twapSlippageAdjustedBuyAmount = atom<CurrencyAmount<Token> | null>((get) => {
  const { outputCurrencyAmount } = get(advancedOrdersDerivedStateAtom)

  if (!outputCurrencyAmount) return null

  const slippage = get(twapOrderSlippageAtom)

  const slippageAmount = outputCurrencyAmount.multiply(slippage)
  const buyAmount = outputCurrencyAmount.subtract(slippageAmount) as CurrencyAmount<Token>

  return FractionUtils.amountToAtLeastOneWei(buyAmount)
})

export const twapOrderAtom = atom<TWAPOrder | null>((get) => {
  const appDataInfo = get(appDataInfoAtom)
  const { account } = get(walletInfoAtom)
  const { numberOfPartsValue } = get(twapOrdersSettingsAtom)
  const timeInterval = get(twapTimeIntervalAtom)
  const { inputCurrencyAmount, recipient, recipientAddress } = get(advancedOrdersDerivedStateAtom)
  const buyAmount = get(twapSlippageAdjustedBuyAmount)

  if (!inputCurrencyAmount || !buyAmount || !account) return null

  return {
    sellAmount: inputCurrencyAmount as CurrencyAmount<Token>,
    buyAmount,
    receiver: recipientAddress || recipient || account,
    numOfParts: numberOfPartsValue,
    startTime: 0, // Will be set to a block timestamp value from CurrentBlockTimestampFactory
    timeInterval,
    span: 0,
    appData: appDataInfo?.appDataKeccak256 || getAppData().appDataKeccak256,
  }
})
