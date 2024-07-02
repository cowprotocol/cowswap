import { atom } from 'jotai'

import { ReceiveAmountInfo, receiveAmountInfoAtom } from 'modules/trade'

import { twapOrdersSettingsAtom } from './twapOrdersSettingsAtom'

import { calculateTwapReceivedAmountInfo } from '../utils/calculateTwapReceivedAmountInfo'

export const scaledReceiveAmountInfoAtom = atom<ReceiveAmountInfo | null>((get) => {
  const { numberOfPartsValue } = get(twapOrdersSettingsAtom)
  const receiveAmountInfo = get(receiveAmountInfoAtom)

  return calculateTwapReceivedAmountInfo(receiveAmountInfo, numberOfPartsValue)
})
