import { useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'

import { PathMatch } from '@remix-run/router'
import { useMatch } from 'react-router-dom'

import { Routes, TRADE_WIDGET_PREFIX } from 'common/constants/routes'

import { tradeTypeAtom } from '../state/tradeTypeAtom'
import { TradeType } from '../types'

export function useSetupTradeTypeInfo() {
  const setTradeType = useSetAtom(tradeTypeAtom)
  const swapMatch = !!useMatchTradeRoute('swap')
  const limitOrderMatch = !!useMatchTradeRoute('limit')
  const advancedOrdersMatch = !!useMatchTradeRoute('advanced')

  const type = useMemo(() => {
    if (swapMatch) return { tradeType: TradeType.SWAP, route: Routes.SWAP }
    if (limitOrderMatch) return { tradeType: TradeType.LIMIT_ORDER, route: Routes.LIMIT_ORDER }
    if (advancedOrdersMatch) return { tradeType: TradeType.ADVANCED_ORDERS, route: Routes.ADVANCED_ORDERS }

    return null
  }, [swapMatch, limitOrderMatch, advancedOrdersMatch])

  useEffect(() => {
    setTradeType(type)
  }, [type, setTradeType])
}

function useMatchTradeRoute(route: string): PathMatch<'chainId'> | null {
  const withChainId = useMatch({ path: `/:chainId${TRADE_WIDGET_PREFIX}/${route}/`, end: false })
  const withoutChainId = useMatch({ path: `${TRADE_WIDGET_PREFIX}/${route}/`, end: false })

  return withChainId || withoutChainId
}
