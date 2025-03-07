import { useMemo } from 'react'

import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { useSendBatchTransactions } from '@cowprotocol/wallet'

import useSWR from 'swr'

import { useAmountsToSign } from 'modules/trade'

import { useGP2SettlementContract, useTokenContract, useWethContract } from 'common/hooks/useContract'
import { useNeedsApproval } from 'common/hooks/useNeedsApproval'
import { useTradeSpenderAddress } from 'common/hooks/useTradeSpenderAddress'

import { SafeBundleFlowContext } from '../types/TradeFlowContext'

export function useSafeBundleFlowContext(): SafeBundleFlowContext | null {
  const { contract: settlementContract, chainId: settlementChainId } = useGP2SettlementContract()
  const spender = useTradeSpenderAddress()

  const sendBatchTransactions = useSendBatchTransactions()
  const { contract: wrappedNativeContract, chainId: wrappedNativeChainId } = useWethContract()

  const { maximumSendSellAmount } = useAmountsToSign() || {}

  const needsApproval = useNeedsApproval(maximumSendSellAmount)
  const inputCurrencyAddress = useMemo(() => {
    return maximumSendSellAmount ? getCurrencyAddress(maximumSendSellAmount.currency) : undefined
  }, [maximumSendSellAmount])
  const { contract: erc20Contract, chainId: erc20ChainId } = useTokenContract(inputCurrencyAddress)

  return (
    useSWR(
      settlementChainId === erc20ChainId &&
        settlementChainId === wrappedNativeChainId &&
        settlementContract &&
        spender &&
        wrappedNativeContract &&
        erc20Contract
        ? [settlementContract, spender, sendBatchTransactions, wrappedNativeContract, needsApproval, erc20Contract]
        : null,
      ([settlementContract, spender, sendBatchTransactions, wrappedNativeContract, needsApproval, erc20Contract]) => {
        return {
          settlementContract,
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
