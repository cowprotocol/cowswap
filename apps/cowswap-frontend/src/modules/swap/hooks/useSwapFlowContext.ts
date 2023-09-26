import { GP_VAULT_RELAYER } from '@cowprotocol/common-const'
import { useGP2SettlementContract } from '@cowprotocol/common-hooks'
import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { TradeType as UniTradeType } from '@uniswap/sdk-core'

import { useIsTokenPermittable } from 'modules/permit'
import { FlowType, getFlowContext, useBaseFlowContextSetup } from 'modules/swap/hooks/useFlowContext'
import { SwapFlowContext } from 'modules/swap/services/types'
import { useEnoughBalanceAndAllowance } from 'modules/tokens'
import { TradeType } from 'modules/trade'

export function useSwapFlowContext(): SwapFlowContext | null {
  const contract = useGP2SettlementContract()
  const baseProps = useBaseFlowContextSetup()
  const sellCurrency = baseProps.trade?.inputAmount?.currency
  const permitInfo = useIsTokenPermittable(sellCurrency, TradeType.SWAP)

  const checkAllowanceAddress = GP_VAULT_RELAYER[baseProps.chainId || SupportedChainId.MAINNET]
  const { enoughAllowance } = useEnoughBalanceAndAllowance({
    account: baseProps.account,
    amount: baseProps.inputAmountWithSlippage,
    checkAllowanceAddress,
  })

  if (!baseProps.trade) return null

  const baseContext = getFlowContext({
    baseProps,
    sellToken: baseProps.trade.inputAmount.currency.wrapped,
    kind: baseProps.trade.tradeType === UniTradeType.EXACT_INPUT ? OrderKind.SELL : OrderKind.BUY,
  })

  if (!contract || !baseContext || baseProps.flowType !== FlowType.REGULAR) return null

  return {
    ...baseContext,
    contract,
    permitInfo: !enoughAllowance ? permitInfo : undefined,
  }
}
