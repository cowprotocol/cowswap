import { OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { TradeType } from '@uniswap/sdk-core'

import { GP_VAULT_RELAYER } from 'legacy/constants'
import { useGP2SettlementContract } from 'legacy/hooks/useContract'

import { useIsTokenPermittable } from 'modules/permit'
import { FlowType, getFlowContext, useBaseFlowContextSetup } from 'modules/swap/hooks/useFlowContext'
import { SwapFlowContext } from 'modules/swap/services/types'
import { useEnoughBalanceAndAllowance } from 'modules/tokens'

export function useSwapFlowContext(): SwapFlowContext | null {
  const contract = useGP2SettlementContract()
  const baseProps = useBaseFlowContextSetup()
  const sellCurrency = baseProps.trade?.inputAmount?.currency
  const permitInfo = useIsTokenPermittable(sellCurrency)

  const checkAllowanceAddress = GP_VAULT_RELAYER[baseProps.chainId || SupportedChainId.MAINNET]
  const { enoughAllowance: hasEnoughAllowance } = useEnoughBalanceAndAllowance({
    account: baseProps.account,
    amount: baseProps.inputAmountWithSlippage,
    checkAllowanceAddress,
  })

  if (!baseProps.trade) return null

  const baseContext = getFlowContext({
    baseProps,
    sellToken: baseProps.trade.inputAmount.currency.wrapped,
    kind: baseProps.trade.tradeType === TradeType.EXACT_INPUT ? OrderKind.SELL : OrderKind.BUY,
  })

  if (!contract || !baseContext || baseProps.flowType !== FlowType.REGULAR) return null

  return {
    ...baseContext,
    contract,
    permitInfo,
    hasEnoughAllowance,
  }
}
