import { getWrappedToken } from '@cowprotocol/common-utils'
import { CurrencyAmount, Token } from '@cowprotocol/currency'
import { useIsTxBundlingSupported, useWalletDetails } from '@cowprotocol/wallet'

import { ApproveRequiredReason, useGetAmountToSignApprove, useIsApprovalOrPermitRequired } from 'modules/erc20Approve'
import { useNeedsZeroApproval } from 'modules/zeroApproval'

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
 * Some tokens — USDT is the famous one — refuse to change a non-zero allowance
 * directly, so the approval has to be set to zero first. That's TWO transactions
 * and two wallet prompts, and "why is it asking me to approve twice?" is a
 * genuinely confusing moment worth warning about rather than explaining afterwards.
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

  const amountToApprove = useGetAmountToSignApprove()
  const needsApproval = reason === ApproveRequiredReason.Required
  const wrappedAmount =
    amountToApprove && !amountToApprove.currency.isNative
      ? (CurrencyAmount.fromRawAmount(
          getWrappedToken(amountToApprove.currency),
          amountToApprove.quotient.toString(),
        ) as CurrencyAmount<Token>)
      : null

  const needsZeroFirst = useNeedsZeroApproval(
    wrappedAmount,
    wrappedAmount ? BigInt(wrappedAmount.quotient.toString()) : null,
    needsApproval,
  )

  switch (reason) {
    case ApproveRequiredReason.Required:
      return { status: 'approval_transaction', ...(needsZeroFirst ? { needsZeroFirst: true } : {}) }
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
