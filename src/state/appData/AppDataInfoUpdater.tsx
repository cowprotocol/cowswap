import React from 'react'
import { useDerivedSwapInfo } from 'state/swap/hooks'
import { useAppData, UseAppDataParams } from 'hooks/useAppData'
import { OrderClass } from '@cowprotocol/cow-sdk'
import { LIMIT_ORDER_SLIPPAGE } from '@cow/modules/limitOrders/const/trade'
import { TradeType, useTradeTypeInfo } from '@cow/modules/trade'
import { percentToBips } from 'utils/misc'
import { useWalletInfo } from '@cow/modules/wallet'

export function AppDataUpdater() {
  const { chainId } = useWalletInfo()
  const { allowedSlippage: allowedSlippageSwap } = useDerivedSwapInfo()
  const tradeTypeInfo = useTradeTypeInfo()

  if (!chainId || !tradeTypeInfo) return null

  const isSwapOrder = tradeTypeInfo.tradeType === TradeType.SWAP
  const allowedSlippage = isSwapOrder ? allowedSlippageSwap : LIMIT_ORDER_SLIPPAGE
  const slippageBips = percentToBips(allowedSlippage)
  const orderClass = isSwapOrder ? OrderClass.MARKET : OrderClass.LIMIT

  return <AppDataUpdaterMemo chainId={chainId} slippageBips={slippageBips} orderClass={orderClass} />
}

const AppDataUpdaterMemo = React.memo(({ chainId, slippageBips, orderClass }: UseAppDataParams) => {
  useAppData({ chainId, slippageBips, orderClass })

  return null
})
