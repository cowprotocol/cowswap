import { useMemo } from 'react'

import { useTradeSpenderAddress } from '@cowprotocol/balances-and-allowances'
import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { useSendBatchTransactions } from '@cowprotocol/wallet'

import { useGetAmountToSignApprove } from 'modules/erc20Approve'
import { useAmountsToSignFromQuote } from 'modules/trade'

import { useTokenContract, useWethContractData } from 'common/hooks/useContract'
import { useNeedsApproval } from 'common/hooks/useNeedsApproval'

import { SafeBundleFlowContext } from '../types/TradeFlowContext'

export function useSafeBundleFlowContext(): SafeBundleFlowContext | null {
  const spender = useTradeSpenderAddress()

  const amountToApprove = useGetAmountToSignApprove()
  const sendBatchTransactions = useSendBatchTransactions()
  const wrappedNativeContract = useWethContractData()

  // todo check for safe wallet
  const { maximumSendSellAmount } = useAmountsToSignFromQuote() || {}

  const needsApproval = useNeedsApproval(maximumSendSellAmount)
  const inputCurrencyAddress = useMemo(() => {
    return maximumSendSellAmount ? getCurrencyAddress(maximumSendSellAmount.currency) : undefined
  }, [maximumSendSellAmount])
  const { contract: erc20Contract } = useTokenContract(inputCurrencyAddress)

  return useMemo(() => {
    if (!spender || !wrappedNativeContract || !erc20Contract || !amountToApprove) {
      return null
    }

    return {
      spender,
      sendBatchTransactions,
      wrappedNativeContract,
      needsApproval,
      erc20Contract,
      amountToApprove,
    }
  }, [spender, sendBatchTransactions, wrappedNativeContract, needsApproval, erc20Contract, amountToApprove])
}
