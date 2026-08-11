import { logTwap, normalizeError } from '@cowprotocol/common-utils'
import { walletInfoAtom } from '@cowprotocol/wallet'

import { eoaTwapOrdersAtom } from 'entities/twap'
import { atomEffect } from 'jotai-effect'

import { eoaTwapOrdersQueryAtom } from './eoaTwapOrdersQueryAtom'

export const eoaTwapOrdersEffectAtom = atomEffect((get, set) => {
  const { chainId } = get(walletInfoAtom)
  const { data, error: err } = get(eoaTwapOrdersQueryAtom)

  if (data) {
    set(eoaTwapOrdersAtom, (currentOrders) => ({ ...currentOrders, ...data.orders }))
  }

  if (err) {
    const error = normalizeError(err)
    logTwap.error(error, { chainId: String(chainId) })
  }
})
