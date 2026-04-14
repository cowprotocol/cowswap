import { useMemo } from 'react'

import { useTradeSpenderAddress } from '@cowprotocol/balances-and-allowances'
import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { useSendBatchTransactions } from '@cowprotocol/wallet'

import { useGetAmountToSignApprove } from 'modules/erc20Approve'
import { useAmountsToSignFromQuote } from 'modules/trade'

import { useWethContractData } from 'common/hooks/useContract'
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
  const tokenAddress = useMemo(() => {
    return maximumSendSellAmount ? getCurrencyAddress(maximumSendSellAmount.currency) : undefined
  }, [maximumSendSellAmount])

  return useMemo(() => {
    if (!spender || !wrappedNativeContract || !tokenAddress || !amountToApprove) {
      return null
    }

    return {
      spender,
      sendBatchTransactions,
      wrappedNativeContract,
      needsApproval,
      tokenAddress,
      amountToApprove,
    }
  }, [spender, sendBatchTransactions, wrappedNativeContract, needsApproval, tokenAddress, amountToApprove])
}
