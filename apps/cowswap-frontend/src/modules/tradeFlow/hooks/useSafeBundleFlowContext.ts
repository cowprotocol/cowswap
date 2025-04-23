import { useMemo } from 'react'

import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { useSendBatchTransactions } from '@cowprotocol/wallet'

import useSWR from 'swr'

import { useAmountsToSign } from 'modules/trade'

import { useTokenContract, useWethContract } from 'common/hooks/useContract'
import { useNeedsApproval } from 'common/hooks/useNeedsApproval'
import { useTradeSpenderAddress } from 'common/hooks/useTradeSpenderAddress'

import { SafeBundleFlowContext } from '../types/TradeFlowContext'

export function useSafeBundleFlowContext(): SafeBundleFlowContext | null {
  const spender = useTradeSpenderAddress()

  const sendBatchTransactions = useSendBatchTransactions()
  const { contract: wrappedNativeContract } = useWethContract()

  const { maximumSendSellAmount } = useAmountsToSign() || {}

  const needsApproval = useNeedsApproval(maximumSendSellAmount)
  const inputCurrencyAddress = useMemo(() => {
    return maximumSendSellAmount ? getCurrencyAddress(maximumSendSellAmount.currency) : undefined
  }, [maximumSendSellAmount])
  const { contract: erc20Contract } = useTokenContract(inputCurrencyAddress)

  return (
    useSWR(
      spender && wrappedNativeContract && erc20Contract
        ? [spender, sendBatchTransactions, wrappedNativeContract, needsApproval, erc20Contract]
        : null,
      ([spender, sendBatchTransactions, wrappedNativeContract, needsApproval, erc20Contract]) => {
        return {
          spender,
          sendBatchTransactions,
          wrappedNativeContract,
          needsApproval,
          erc20Contract,
        }
      },
    ).data || null
  )
}
