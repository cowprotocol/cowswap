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
 * - a **bundle** does the approval and the trade together in one transaction
 *
 * ⚠️ A bundle is NOT a Safe. `useIsTxBundlingSupported` reads
 * `isAtomicBatchSupportedAtom` — EIP-5792 atomic batching, a capability wallets
 * advertise through `wallet_getCapabilities` — and plenty of ordinary EOA wallets
 * support it. Nothing here reports the wallet's type, and `AssistantApproval`
 * deliberately carries no field for one.
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
/**
 * ⚠️ **FOR REVIEW BEFORE MERGE — this does one on-chain read while the panel is closed.**
 *
 * `useAssistantContext` runs on every render of the drawer, and the drawer is mounted
 * in `AppContainer`: it returns `null` when closed but its hooks still run. Most of
 * what it reads is free — Jotai atoms that the app's own updaters populate regardless
 * — and the approval hooks below are shared with `tradeFormValidation` and
 * `tradeFlow`, so that work happens anyway.
 *
 * The exception is `useNeedsZeroApproval`. It calls `shouldZeroApproveFn`, a real
 * allowance read via wagmi, and it holds the result in local `useState` rather than a
 * shared cache — so this call does **not** dedupe with the TWAP module's. It
 * short-circuits unless `needsApproval` is true, which requires a real trade in the
 * form with an approval genuinely pending, so the blast radius is small: one extra
 * allowance read, in one state, for someone who never opened the assistant.
 *
 * Small, but it means "the closed panel costs nothing" is *nearly* true rather than
 * true. The fix is the same shape as `useOpenLimitOrders`: gate on
 * `assistantDrawerOpenAtom` and pass nothing to the approval hooks while closed. Left
 * undone deliberately so a reviewer can decide whether the assistant should read
 * anything at all before it is opened — that is a house call, not mine.
 *
 * Precedent for how badly this can go: the open-orders lookup shipped with
 * `useBalancesAndAllowances` running on every page, which re-fetched every 32 seconds
 * for every visitor, and the e2e smoke run caught it.
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
