import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { isSolanaChain } from '@cowprotocol/cow-sdk'
import { useIsTxBundlingSupported, useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { useInjectedWidgetParams } from 'entities/injectedWidget'

import { ApproveRequiredReason, useIsApprovalOrPermitRequired } from 'modules/erc20Approve'

import { useIsProviderNetworkDeprecated } from 'common/hooks/useIsProviderNetworkDeprecated'
import { useIsSafeApprovalBundle } from 'common/hooks/useIsSafeApprovalBundle'

import { useAmountsToSignFromQuote } from './useAmountsToSignFromQuote'
import { useIsCurrentTradeBridging } from './useIsCurrentTradeBridging'
import { useIsEoaEthFlow } from './useIsEoaEthFlow'

/**
 * Whether Wait & Save may be offered: feature flag on, not Solana, not a deprecated network,
 * not a bridge trade, not hidden by the widget host, and the order will not be posted as a presign.
 *
 * Bridge orders are excluded because the batch wait is uncertain and bridge providers
 * require timely fund delivery. Presign is excluded because Safe bundles and wallets that
 * cannot sign off-chain post `SigningScheme.PRESIGN`. A disconnected wallet stays eligible:
 * `allowsOffchainSigning` defaults to false before connect.
 */
export function useIsWaitAndSaveAvailable(): boolean {
  const { chainId } = useWalletInfo()
  const { isWaitForCowsEnabled } = useFeatureFlags()
  const { hideWaitAndSave } = useInjectedWidgetParams()
  const isProviderNetworkDeprecated = useIsProviderNetworkDeprecated()
  const isBridging = useIsCurrentTradeBridging()
  const willPostPresign = useWillPostPresign()

  return Boolean(
    isWaitForCowsEnabled &&
      !hideWaitAndSave &&
      !isSolanaChain(chainId) &&
      !isProviderNetworkDeprecated &&
      !isBridging &&
      !willPostPresign,
  )
}

/** Whether the order about to be posted uses `SigningScheme.PRESIGN`. */
function useWillPostPresign(): boolean {
  const { account } = useWalletInfo()
  const { allowsOffchainSigning } = useWalletDetails()
  const isBundlingSupported = useIsTxBundlingSupported()
  const isEoaEthFlow = useIsEoaEthFlow()
  const { maximumSendSellAmount } = useAmountsToSignFromQuote() || {}
  const isSafeBundle = useIsSafeApprovalBundle(maximumSendSellAmount)
  const { reason: approvalReason } = useIsApprovalOrPermitRequired({
    isBundlingSupportedOrEnabledForContext: isBundlingSupported,
    allowsOffchainSigning,
  })
  const isPermitRequired =
    approvalReason === ApproveRequiredReason.Eip2612PermitRequired ||
    approvalReason === ApproveRequiredReason.DaiLikePermitRequired

  // `allowsOffchainSigning` is false before connect, so a missing account must not hide Wait & Save.
  // Covers Safe, including ETH sells.
  if (account && !allowsOffchainSigning) return true

  // A wallet that can sign off-chain still posts a presign for a bundled approval that is not a permit.
  // An ETH sell on that wallet signs EIP-1271, and the wrapped amount can still look like a bundle.
  return isSafeBundle && !isPermitRequired && !isEoaEthFlow
}
