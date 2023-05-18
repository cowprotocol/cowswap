import React from 'react'
import { useDerivedSwapInfo } from 'state/swap/hooks'
import { useAppData, UseAppDataParams } from 'hooks/useAppData'
import { OrderClass } from '@cowprotocol/cow-sdk'
import { LIMIT_ORDER_SLIPPAGE } from 'modules/limitOrders/const/trade'
import { TradeType, useTradeTypeInfo } from 'modules/trade'
import { percentToBips } from 'utils/misc'
import { useWalletInfo } from 'modules/wallet'
import { useUtm } from 'modules/utm'

export function AppDataUpdater() {
  const { chainId } = useWalletInfo()
  const { allowedSlippage: allowedSlippageSwap } = useDerivedSwapInfo()
  const tradeTypeInfo = useTradeTypeInfo()
  const utm = useUtm()

  if (!chainId || !tradeTypeInfo) return null

  const isSwapOrder = tradeTypeInfo.tradeType === TradeType.SWAP
  const allowedSlippage = isSwapOrder ? allowedSlippageSwap : LIMIT_ORDER_SLIPPAGE
  const slippageBips = percentToBips(allowedSlippage)
  const orderClass = isSwapOrder ? OrderClass.MARKET : OrderClass.LIMIT

  return <AppDataUpdaterMemo chainId={chainId} slippageBips={slippageBips} orderClass={orderClass} utm={utm} />
}

const AppDataUpdaterMemo = React.memo(({ chainId, slippageBips, orderClass, utm }: UseAppDataParams) => {
  useAppData({ chainId, slippageBips, orderClass, utm })

  return null
})
