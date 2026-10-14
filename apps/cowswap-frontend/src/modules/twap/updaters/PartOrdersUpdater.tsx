import { useAtomValue, useSetAtom, useStore } from 'jotai'
import { useEffect } from 'react'

import { getAddressKey } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'

import { twapOrdersListAtom } from 'entities/twap'

import { setPartOrdersAtom, twapPartOrdersAtom } from '../state/twapPartOrdersAtom'
import { generateTwapOrderParts } from '../utils/buildTwapParts'

export function PartOrdersUpdater(): null {
  const store = useStore()
  const { chainId, account } = useWalletInfo()
  const twapOrders = useAtomValue(twapOrdersListAtom)
  const updateTwapPartOrders = useSetAtom(setPartOrdersAtom)

  useEffect(() => {
    if (!chainId || !account) return

    const accountKey = getAddressKey(account)

    let cancelled = false

    Promise.resolve(store.get(twapPartOrdersAtom))
      .then((cachedParts) =>
        Promise.all(
          twapOrders.map((order) => generateTwapOrderParts(order, accountKey, chainId, cachedParts[order.id])),
        ),
      )
      .then((ordersParts) => {
        if (cancelled) return
        const ordersMap = ordersParts.reduce((acc, item) => {
          return {
            ...acc,
            ...item,
          }
        }, {})

        updateTwapPartOrders(ordersMap)
      })

    return () => {
      cancelled = true
    }
  }, [chainId, account, twapOrders, updateTwapPartOrders, store])

  return null
}
