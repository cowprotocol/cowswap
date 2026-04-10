import { useAtomValue, useSetAtom } from 'jotai'
import { type ReactNode, useCallback, useMemo } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletChainId } from '@cowprotocol/wallet-provider'

import { t } from '@lingui/core/macro'

import { useToggleWalletModal } from 'legacy/state/application/hooks'

import { trackAffiliateEvent } from '../analytics/affiliateAnalytics.utils'
import { useAffiliateTraderCodeInput } from '../hooks/useAffiliateTraderCodeInput'
import { useAffiliateTraderInfo } from '../hooks/useAffiliateTraderInfo'
import { TraderWalletStatus, useAffiliateTraderWallet } from '../hooks/useAffiliateTraderWallet'
import { formatRefCode, isSupportedPayoutsNetwork } from '../lib/affiliateProgramUtils'
import { AffiliateTradeCodeForm } from '../pure/AffiliateTraderModal/AffiliateTradeCodeForm'
import { affiliateTraderModalAtom, closeTraderModalAtom } from '../state/affiliateTraderModalAtom'
import {
  affiliateTraderPayoutConfirmationAtom,
  setAffiliateTraderPayoutConfirmationAtom,
} from '../state/affiliateTraderPayoutConfirmationAtom'
import { affiliateTraderSavedCodeAtom } from '../state/affiliateTraderSavedCodeAtom'

export function AffiliateTraderModalCodeLinking(): ReactNode {
  const { account } = useWalletInfo()
  const chainId = useWalletChainId()
  const analytics = useCowAnalytics()
  const toggleWalletModal = useToggleWalletModal()
  const closeAffiliateModal = useSetAtom(closeTraderModalAtom)

  const walletStatus = useAffiliateTraderWallet()
  const requiresPayoutConfirmation = !!account && !isSupportedPayoutsNetwork(chainId)
  const payoutConfirmed = useAtomValue(affiliateTraderPayoutConfirmationAtom)
  const setPayoutConfirmed = useSetAtom(setAffiliateTraderPayoutConfirmationAtom)
  const { source: entrySource } = useAtomValue(affiliateTraderModalAtom)
  const { codeInput, codeSource, error, isVerifying, verifyCode, onChange, onEdit, onRemove } =
    useAffiliateTraderCodeInput({
      requiresPayoutConfirmation,
      walletStatus,
    })
  const { savedCode } = useAtomValue(affiliateTraderSavedCodeAtom)
  const { data: codeInfo } = useAffiliateTraderInfo(savedCode)
  const showInvalidFormat = !!codeInput && !formatRefCode(codeInput)

  const onTogglePayoutConfirmed = useCallback(
    (checked: boolean): void => {
      if (isVerifying) return
      trackAffiliateEvent({
        analytics,
        action: 'affiliate_trader_payout_confirmation_toggled',
        checked,
      })
      setPayoutConfirmed(checked)
    },
    [analytics, isVerifying, setPayoutConfirmed],
  )

  const submitButtonLabel = useMemo(() => {
    if (isVerifying) return t`Checking code...`
    if (savedCode) return t`Start trading`
    if (!account) return t`Connect to verify code`
    return t`Verify code`
  }, [account, isVerifying, savedCode])

  const onSubmit = useCallback((): void => {
    if (isVerifying || walletStatus === TraderWalletStatus.UNSUPPORTED) return
    if (savedCode) {
      trackAffiliateEvent({
        analytics,
        action: 'affiliate_trader_modal_primary_cta_clicked',
        ctaType: 'startTrading',
        entrySource,
        walletStatus,
      })
      closeAffiliateModal()
      return
    }
    if (!account) {
      trackAffiliateEvent({
        analytics,
        action: 'affiliate_trader_modal_primary_cta_clicked',
        ctaType: 'connectToVerify',
        entrySource,
        walletStatus,
      })
      toggleWalletModal()
      return
    }
    void verifyCode({ code: codeInput, account, codeSource })
  }, [
    account,
    analytics,
    codeInput,
    codeSource,
    closeAffiliateModal,
    entrySource,
    isVerifying,
    savedCode,
    toggleWalletModal,
    verifyCode,
    walletStatus,
  ])

  return (
    <AffiliateTradeCodeForm
      walletStatus={walletStatus}
      account={account}
      requiresPayoutConfirmation={!!account && !savedCode && requiresPayoutConfirmation}
      codeInfo={codeInfo}
      payoutConfirmed={payoutConfirmed}
      onTogglePayoutConfirmed={onTogglePayoutConfirmed}
      value={codeInput}
      onChange={onChange}
      showInvalidFormat={showInvalidFormat}
      savedCode={savedCode}
      isLoading={isVerifying}
      error={error}
      onEdit={onEdit}
      onRemove={onRemove}
      submitButtonLabel={submitButtonLabel}
      onSubmit={onSubmit}
    />
  )
}
