import { useMemo } from 'react'

import { getCurrencyAddress } from '@cowprotocol/common-utils'
import { useSafeAppsSdk } from '@cowprotocol/wallet'

import useSWR from 'swr'

import { useReceiveAmountInfo } from 'modules/trade'

import { useGP2SettlementContract, useTokenContract, useWethContract } from 'common/hooks/useContract'
import { useNeedsApproval } from 'common/hooks/useNeedsApproval'
import { useTradeSpenderAddress } from 'common/hooks/useTradeSpenderAddress'

import { SafeBundleFlowContext } from '../types/TradeFlowContext'

export function useSafeBundleFlowContext(): SafeBundleFlowContext | null {
  const { contract: settlementContract, chainId: settlementChainId } = useGP2SettlementContract()
  const spender = useTradeSpenderAddress()

  const safeAppsSdk = useSafeAppsSdk()
  const { contract: wrappedNativeContract, chainId: wrappedNativeChainId } = useWethContract()

  const receiveAmountInfo = useReceiveAmountInfo()
  const inputAmountWithSlippage = receiveAmountInfo?.afterSlippage.sellAmount
  const needsApproval = useNeedsApproval(inputAmountWithSlippage)
  const inputCurrencyAddress = useMemo(() => {
    return inputAmountWithSlippage ? getCurrencyAddress(inputAmountWithSlippage.currency) : undefined
  }, [inputAmountWithSlippage])
  const { contract: erc20Contract, chainId: erc20ChainId } = useTokenContract(inputCurrencyAddress)
  const key =
    settlementChainId === erc20ChainId &&
    settlementChainId === wrappedNativeChainId &&
    settlementContract &&
    spender &&
    safeAppsSdk &&
    wrappedNativeContract &&
    erc20Contract
      ? [settlementContract, spender, safeAppsSdk, wrappedNativeContract, needsApproval, erc20Contract]
      : null

  return (
    useSWR(key, ([settlementContract, spender, safeAppsSdk, wrappedNativeContract, needsApproval, erc20Contract]) => {
      return {
        settlementContract,
        spender,
        safeAppsSdk,
        wrappedNativeContract,
        needsApproval,
        erc20Contract,
      }
    }).data || null
  )
}
