import { useIsTxBundlingSupported, useWalletDetails } from '@cowprotocol/wallet'

import { ApproveRequiredReason, useIsApprovalOrPermitRequired } from 'modules/erc20Approve'

import { AssistantApproval } from '../types'

/**
 * What the user will be asked to do before this trade can go through.
 *
 * ⚠️ **Do not build this on `useNeedsApproval`.** That hook compares an allowance
 * and knows nothing about permits, so it reports "approval needed" for tokens the
 * user will never send an approval transaction for — telling someone to spend gas
 * they don't need to spend. `useIsApprovalOrPermitRequired` is the hook that
 * actually decides, weighing permit support, whether the wallet can sign off-chain,
 * Safe bundling, and native-token flows.
 *
 * The distinction is the whole point of surfacing this at all:
 * - a **permit** is a signature — free, instant, no gas
 * - an **approval** is an on-chain transaction — costs gas, unlike the trade itself
 * - a **bundle** (Safe) does the approval and the trade together
 *
 * An approval is where a first-time CoW user meets an unexpected gas fee on a
 * product sold as gasless, and nothing in the UI explains it in advance.
 *
 * `ignoreLimitOrderPermitDeferral: true` is deliberate. Limit orders defer the
 * permit signature to the confirm step, so the hook otherwise reports NotRequired
 * while a permit is in fact about to be requested — and telling someone "nothing
 * else needed" moments before their wallet asks them to sign something is exactly
 * the surprise this is meant to remove.
 */
export function useApprovalContext(): AssistantApproval | null {
  const isBundlingSupported = useIsTxBundlingSupported()
  const { allowsOffchainSigning } = useWalletDetails()

  const { reason } = useIsApprovalOrPermitRequired({
    isBundlingSupportedOrEnabledForContext: isBundlingSupported,
    allowsOffchainSigning,
    ignoreLimitOrderPermitDeferral: true,
  })

  switch (reason) {
    case ApproveRequiredReason.Required:
      return { status: 'approval_transaction' }
    case ApproveRequiredReason.Eip2612PermitRequired:
      return { status: 'permit_signature', permitType: 'eip-2612' }
    case ApproveRequiredReason.DaiLikePermitRequired:
      return { status: 'permit_signature', permitType: 'dai-like' }
    case ApproveRequiredReason.BundleApproveRequired:
      return { status: 'bundled_with_trade' }
    // NotRequired and Unsupported both mean "nothing extra to mention". Absent
    // rather than a status, so silence stays the default.
    default:
      return null
  }
}
