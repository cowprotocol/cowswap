import React from 'react'

import { OrderClass } from '@cowprotocol/cow-sdk'

import { useDerivedSwapInfo } from 'legacy/state/swap/hooks'
import { percentToBips } from 'legacy/utils/misc'

import { LIMIT_ORDER_SLIPPAGE } from 'modules/limitOrders/const/trade'
import { TradeType, useTradeTypeInfo } from 'modules/trade'
import { useUtm } from 'modules/utm'
import { useWalletInfo } from 'modules/wallet'

import { useAppDataUpdater, UseAppDataParams } from './useAppDataUpdater'

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
  useAppDataUpdater({ chainId, slippageBips, orderClass, utm })

  return null
})
