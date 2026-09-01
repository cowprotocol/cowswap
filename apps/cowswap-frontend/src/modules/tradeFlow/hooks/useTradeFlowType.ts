import { isSolanaChain } from '@cowprotocol/cow-sdk'
import { useIsTxBundlingSupported, useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { ApproveRequiredReason, useIsApprovalOrPermitRequired } from 'modules/erc20Approve'
import { useAmountsToSignFromQuote, useIsEoaEthFlow, useIsSafeEthFlow } from 'modules/trade'

import { useIsSafeApprovalBundle } from 'common/hooks/useIsSafeApprovalBundle'

import { FlowType } from '../types/TradeFlowContext'

export function getFlowType(
  isSolana: boolean,
  isSafeBundle: boolean,
  isEoaEthFlow: boolean,
  isSafeEthFlow: boolean,
  isPermitRequired: boolean,
): FlowType {
  if (isSolana) {
    // Solana has no EOA/Safe/bundling concepts — takes precedence over everything else
    return FlowType.SOLANA_SWAP
  }
  if (isEoaEthFlow) {
    // Takes precedence when EIP-7702 also supports bundling
    return FlowType.EOA_ETH_FLOW
  }
  if (isSafeEthFlow) {
    // Takes precedence over bundle approval
    return FlowType.SAFE_BUNDLE_ETH
  }
  if (isSafeBundle && !isPermitRequired) {
    // Takes precedence over eth flow
    return FlowType.SAFE_BUNDLE_APPROVAL
  }
  return FlowType.REGULAR
}

export function useTradeFlowType(): FlowType {
  const { chainId } = useWalletInfo()
  const isSolana = isSolanaChain(chainId)
  const isEoaEthFlow = useIsEoaEthFlow()
  const isSafeEthFlow = useIsSafeEthFlow()
  const isBundlingSupported = useIsTxBundlingSupported()
  const { allowsOffchainSigning } = useWalletDetails()
  const { maximumSendSellAmount } = useAmountsToSignFromQuote() || {}
  const isSafeBundle = useIsSafeApprovalBundle(maximumSendSellAmount)
  const { reason: approvalReason } = useIsApprovalOrPermitRequired({
    isBundlingSupportedOrEnabledForContext: isBundlingSupported,
    allowsOffchainSigning,
  })
  const isPermitRequired =
    approvalReason === ApproveRequiredReason.Eip2612PermitRequired ||
    approvalReason === ApproveRequiredReason.DaiLikePermitRequired

  return getFlowType(isSolana, isSafeBundle, isEoaEthFlow, isSafeEthFlow, isPermitRequired)
}
