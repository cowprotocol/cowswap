import React from 'react'
import { useWeb3React } from '@web3-react/core'
import { useDerivedSwapInfo } from 'state/swap/hooks'
import { useAppData, UseAppDataParams } from 'hooks/useAppData'
import { OrderClass } from 'state/orders/actions'
import { LIMIT_ORDER_SLIPPAGE } from '@cow/modules/limitOrders/const/trade'
import { TradeType, useTradeTypeInfo } from '@cow/modules/trade'
import { percentToBips } from 'utils/misc'

export function AppDataUpdater() {
  const { chainId } = useWeb3React()
  const { allowedSlippage: allowedSlippageSwap } = useDerivedSwapInfo()
  const tradeTypeInfo = useTradeTypeInfo()

  if (!chainId || !tradeTypeInfo) return null

  const isLimitOrders = tradeTypeInfo.tradeType === TradeType.LIMIT_ORDER
  const allowedSlippage = isLimitOrders ? LIMIT_ORDER_SLIPPAGE : allowedSlippageSwap
  const slippageBips = percentToBips(allowedSlippage)
  const orderClass = isLimitOrders ? OrderClass.LIMIT : OrderClass.MARKET

  return <AppDataUpdaterMemo chainId={chainId} slippageBips={slippageBips} orderClass={orderClass} />
}

const AppDataUpdaterMemo = React.memo(({ chainId, slippageBips, orderClass }: UseAppDataParams) => {
  useAppData({ chainId, slippageBips, orderClass })

  return null
})
