import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { getAddressKey } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { twapOrdersListAtom } from 'entities/twap'

import { setPartOrdersAtom } from '../state/twapPartOrdersAtom'
import { generateTwapOrderParts } from '../utils/buildTwapParts'

export function PartOrdersUpdater(): null {
  const { chainId, account } = useWalletInfo()
  const twapOrders = useAtomValue(twapOrdersListAtom)
  const updateTwapPartOrders = useSetAtom(setPartOrdersAtom)

  useEffect(() => {
    if (!chainId || !account) return

    const accountKey = getAddressKey(account)

    const ordersParts$ = twapOrders.map((twapOrder) => {
      return generateTwapOrderParts(twapOrder, accountKey, chainId)
    })

    Promise.all(ordersParts$).then((ordersParts) => {
      const ordersMap = ordersParts.reduce((acc, item) => {
        return {
          ...acc,
          ...item,
        }
      }, {})

      updateTwapPartOrders(ordersMap)
    })
  }, [chainId, account, twapOrders, updateTwapPartOrders])

  return null
}
