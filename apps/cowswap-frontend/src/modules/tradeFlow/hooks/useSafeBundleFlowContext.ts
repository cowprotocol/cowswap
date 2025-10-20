import { useMemo } from 'react'

import { useTradeSpenderAddress } from '@cowprotocol/balances-and-allowances'
import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { useSendBatchTransactions } from '@cowprotocol/wallet'

import { useAmountsToSignFromQuote } from 'modules/trade'

import { useTokenContract, useWethContract } from 'common/hooks/useContract'
import { useNeedsApproval } from 'common/hooks/useNeedsApproval'

import { SafeBundleFlowContext } from '../types/TradeFlowContext'

export function useSafeBundleFlowContext(partialApproveEnabled = false): SafeBundleFlowContext | null {
  const spender = useTradeSpenderAddress()

  const sendBatchTransactions = useSendBatchTransactions()
  const { contract: wrappedNativeContract } = useWethContract()

  // todo check for safe wallet
  const { maximumSendSellAmount } = useAmountsToSignFromQuote() || {}

  const needsApproval = useNeedsApproval(maximumSendSellAmount)
  const inputCurrencyAddress = useMemo(() => {
    return maximumSendSellAmount ? getCurrencyAddress(maximumSendSellAmount.currency) : undefined
  }, [maximumSendSellAmount])
  const { contract: erc20Contract } = useTokenContract(inputCurrencyAddress)

  return useMemo(() => {
    if (!spender || !wrappedNativeContract || !erc20Contract) {
      return null
    }

    return {
      spender,
      sendBatchTransactions,
      wrappedNativeContract,
      needsApproval,
      erc20Contract,
      partialApproveEnabled,
    }
  }, [spender, sendBatchTransactions, wrappedNativeContract, needsApproval, erc20Contract, partialApproveEnabled])
}
