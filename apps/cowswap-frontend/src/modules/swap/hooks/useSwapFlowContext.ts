import { useMemo } from 'react'

import { getWrappedToken } from '@cowprotocol/common-utils'
import { COW_PROTOCOL_VAULT_RELAYER_ADDRESS, OrderKind, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'
import { TradeType as UniTradeType } from '@uniswap/sdk-core'

import { useAppDataHooks } from 'modules/appData'
import { useGeneratePermitHook, usePermitInfo } from 'modules/permit'
import {
  FlowType,
  getFlowContext,
  useBaseFlowContextSetup,
  useSwapAmountsWithSlippage,
} from 'modules/swap/hooks/useFlowContext'
import { SwapFlowContext } from 'modules/swap/services/types'
import { useEnoughBalanceAndAllowance } from 'modules/tokens'
import { TradeType } from 'modules/trade'

import { useGP2SettlementContract } from 'common/hooks/useContract'

export function useSwapFlowContext(): SwapFlowContext | null {
  const contract = useGP2SettlementContract()
  const baseProps = useBaseFlowContextSetup()
  const sellCurrency = baseProps.trade?.inputAmount?.currency
  const permitInfo = usePermitInfo(sellCurrency, TradeType.SWAP)
  const generatePermitHook = useGeneratePermitHook()
  const typedHooks = useAppDataHooks()

  const checkAllowanceAddress = COW_PROTOCOL_VAULT_RELAYER_ADDRESS[baseProps.chainId || SupportedChainId.MAINNET]
  const { enoughAllowance } = useEnoughBalanceAndAllowance({
    account: baseProps.account,
    amount: baseProps.inputAmountWithSlippage,
    checkAllowanceAddress,
  })

  return useMemo(() => {
    if (!baseProps.trade) {
      return null
    }

    const baseContext = getFlowContext({
      baseProps,
      sellToken: getWrappedToken(baseProps.trade.inputAmount.currency),
      kind: baseProps.trade.tradeType === UniTradeType.EXACT_INPUT ? OrderKind.SELL : OrderKind.BUY,
    })

    if (!contract || !baseContext || baseProps.flowType !== FlowType.REGULAR) {
      return null
    }

    return {
      ...baseContext,
      contract,
      permitInfo: !enoughAllowance ? permitInfo : undefined,
      generatePermitHook,
      typedHooks,
    }
  }, [baseProps, contract, enoughAllowance, permitInfo, generatePermitHook, typedHooks])
}

export function useSwapEnoughAllowance(): boolean | undefined {
  const { chainId, account } = useWalletInfo()
  const [inputAmountWithSlippage] = useSwapAmountsWithSlippage()

  const checkAllowanceAddress = COW_PROTOCOL_VAULT_RELAYER_ADDRESS[chainId]
  const { enoughAllowance } = useEnoughBalanceAndAllowance({
    account,
    amount: inputAmountWithSlippage,
    checkAllowanceAddress,
  })

  return enoughAllowance
}
