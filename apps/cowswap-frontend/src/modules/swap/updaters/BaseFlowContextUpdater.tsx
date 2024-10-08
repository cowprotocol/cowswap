import { useSetAtom } from 'jotai'
import { useEffect } from 'react'

import { getAddress } from '@cowprotocol/common-utils'
import { useENSAddress } from '@cowprotocol/ens'
import { useGnosisSafeInfo, useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'

import { useDispatch } from 'react-redux'

import { AppDispatch } from 'legacy/state'
import { useCloseModals } from 'legacy/state/application/hooks'
import { useGetQuoteAndStatus } from 'legacy/state/price/hooks'
import { useUserTransactionTTL } from 'legacy/state/user/hooks'

import { useAppData, useAppDataHooks, useUploadAppData } from 'modules/appData'
import { useGetCachedPermit } from 'modules/permit'
import { useTradeConfirmActions, useIsEoaEthFlow } from 'modules/trade'
import { useTradeSlippage } from 'modules/tradeSlippage'

import { useTokenContract, useWETHContract } from 'common/hooks/useContract'
import { useIsSafeApprovalBundle } from 'common/hooks/useIsSafeApprovalBundle'
import { useSafeMemo } from 'common/hooks/useSafeMemo'

import { useSwapAmountsWithSlippage } from '../hooks/useFlowContext'
import { useIsSafeEthFlow } from '../hooks/useIsSafeEthFlow'
import { useDerivedSwapInfo, useSwapState } from '../hooks/useSwapState'
import { baseFlowContextSourceAtom } from '../state/baseFlowContextSourceAtom'
import { FlowType } from '../types/flowContext'

export function BaseFlowContextUpdater() {
  const setBaseFlowContextSource = useSetAtom(baseFlowContextSourceAtom)
  const provider = useWalletProvider()
  const { account, chainId } = useWalletInfo()
  const { allowsOffchainSigning } = useWalletDetails()
  const gnosisSafeInfo = useGnosisSafeInfo()
  const { recipient } = useSwapState()
  const slippage = useTradeSlippage()
  const { trade, currenciesIds } = useDerivedSwapInfo()
  const { quote } = useGetQuoteAndStatus({
    token: currenciesIds.INPUT,
    chainId,
  })

  const appData = useAppData()
  const typedHooks = useAppDataHooks()
  const closeModals = useCloseModals()
  const uploadAppData = useUploadAppData()
  const dispatch = useDispatch<AppDispatch>()
  const tradeConfirmActions = useTradeConfirmActions()

  const { address: ensRecipientAddress } = useENSAddress(recipient)
  const recipientAddressOrName = recipient || ensRecipientAddress
  const [deadline] = useUserTransactionTTL()
  const wethContract = useWETHContract()
  const isEoaEthFlow = useIsEoaEthFlow()
  const isSafeEthFlow = useIsSafeEthFlow()
  const getCachedPermit = useGetCachedPermit()

  const [inputAmountWithSlippage, outputAmountWithSlippage] = useSwapAmountsWithSlippage()
  const sellTokenContract = useTokenContract(getAddress(inputAmountWithSlippage?.currency) || undefined, true)

  const isSafeBundle = useIsSafeApprovalBundle(inputAmountWithSlippage)
  const flowType = getFlowType(isSafeBundle, isEoaEthFlow, isSafeEthFlow)

  const source = useSafeMemo(
    () => ({
      chainId,
      account,
      sellTokenContract,
      provider,
      trade,
      appData,
      wethContract,
      inputAmountWithSlippage,
      outputAmountWithSlippage,
      gnosisSafeInfo,
      recipient,
      recipientAddressOrName,
      deadline,
      ensRecipientAddress,
      allowsOffchainSigning,
      uploadAppData,
      flowType,
      closeModals,
      dispatch,
      allowedSlippage: slippage,
      tradeConfirmActions,
      getCachedPermit,
      quote,
      typedHooks,
    }),
    [
      chainId,
      account,
      sellTokenContract,
      provider,
      trade,
      appData,
      wethContract,
      inputAmountWithSlippage,
      outputAmountWithSlippage,
      gnosisSafeInfo,
      recipient,
      recipientAddressOrName,
      deadline,
      ensRecipientAddress,
      allowsOffchainSigning,
      uploadAppData,
      flowType,
      closeModals,
      dispatch,
      slippage,
      tradeConfirmActions,
      getCachedPermit,
      quote,
      typedHooks,
    ],
  )

  useEffect(() => {
    setBaseFlowContextSource(source)
  }, [source, setBaseFlowContextSource])

  return null
}

function getFlowType(isSafeBundle: boolean, isEoaEthFlow: boolean, isSafeEthFlow: boolean): FlowType {
  if (isSafeEthFlow) {
    // Takes precedence over bundle approval
    return FlowType.SAFE_BUNDLE_ETH
  }
  if (isSafeBundle) {
    // Takes precedence over eth flow
    return FlowType.SAFE_BUNDLE_APPROVAL
  }
  if (isEoaEthFlow) {
    // Takes precedence over regular flow
    return FlowType.EOA_ETH_FLOW
  }
  return FlowType.REGULAR
}
