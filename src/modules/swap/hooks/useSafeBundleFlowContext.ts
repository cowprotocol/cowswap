import { TradeType } from '@uniswap/sdk-core'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'
import { SafeBundleFlowContext } from 'modules/swap/services/types'
import { FlowType, getFlowContext, useBaseFlowContextSetup } from 'modules/swap/hooks/useFlowContext'
import { useGP2SettlementContract, useTokenContract } from 'legacy/hooks/useContract'
import { useTradeSpenderAddress } from 'common/hooks/useTradeSpenderAddress'
import { useWeb3React } from '@web3-react/core'
import { useSafeAppsSdk } from 'modules/wallet/web3-react/hooks/useSafeAppsSdk'

export function useSafeBundleFlowContext(): SafeBundleFlowContext | null {
  const baseProps = useBaseFlowContextSetup()
  const addTransaction = useTransactionAdder()
  const sellToken = baseProps.trade ? baseProps.trade.inputAmount.currency.wrapped : undefined
  const erc20Contract = useTokenContract(sellToken?.address)
  const settlementContract = useGP2SettlementContract()
  const spender = useTradeSpenderAddress()
  const safeAppsSdk = useSafeAppsSdk()
  const { provider } = useWeb3React()

  if (!baseProps.trade || !erc20Contract || !settlementContract || !spender || !safeAppsSdk || !provider) return null

  const baseContext = getFlowContext({
    baseProps,
    sellToken,
    kind: baseProps.trade.tradeType === TradeType.EXACT_INPUT ? OrderKind.SELL : OrderKind.BUY,
  })

  if (!baseContext || baseProps.flowType !== FlowType.SAFE_BUNDLE) return null

  return {
    ...baseContext,
    erc20Contract,
    settlementContract,
    spender,
    safeAppsSdk,
    provider,
    addTransaction,
  }
}
