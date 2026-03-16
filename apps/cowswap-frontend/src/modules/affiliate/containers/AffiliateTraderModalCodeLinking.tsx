import { useAtomValue, useSetAtom } from 'jotai'
import { type ReactNode, useCallback, useMemo } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { useWalletInfo } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'

import { useToggleWalletModal } from 'legacy/state/application/hooks'

import { useAffiliateTraderCodeInput } from '../hooks/useAffiliateTraderCodeInput'
import { useAffiliateTraderInfo } from '../hooks/useAffiliateTraderInfo'
import { TraderWalletStatus, useAffiliateTraderWallet } from '../hooks/useAffiliateTraderWallet'
import { isSupportedPayoutsNetwork } from '../lib/affiliateProgramUtils'
import { AffiliateTradeCodeForm } from '../pure/AffiliateTraderModal/AffiliateTradeCodeForm'
import { toggleTraderModalAtom } from '../state/affiliateTraderModalAtom'
import {
  affiliateTraderPayoutConfirmationAtom,
  setAffiliateTraderPayoutConfirmationAtom,
} from '../state/affiliateTraderPayoutConfirmationAtom'
import { affiliateTraderSavedCodeAtom } from '../state/affiliateTraderSavedCodeAtom'

export function AffiliateTraderModalCodeLinking(): ReactNode {
  const { account, chainId } = useWalletInfo()
  const analytics = useCowAnalytics()
  const toggleWalletModal = useToggleWalletModal()
  const toggleAffiliateModal = useSetAtom(toggleTraderModalAtom)

  const walletStatus = useAffiliateTraderWallet()
  const payoutConfirmed = useAtomValue(affiliateTraderPayoutConfirmationAtom)
  const setPayoutConfirmed = useSetAtom(setAffiliateTraderPayoutConfirmationAtom)
  const { codeInput, error, isVerifying, verifyCode, onChange, onEdit, onRemove } = useAffiliateTraderCodeInput()
  const { savedCode } = useAtomValue(affiliateTraderSavedCodeAtom)
  const { data: codeInfo } = useAffiliateTraderInfo(savedCode)

  const onTogglePayoutConfirmed = useCallback(
    (checked: boolean): void => {
      if (isVerifying) return
      setPayoutConfirmed(checked)
    },
    [setPayoutConfirmed, isVerifying],
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
      analytics.sendEvent({ category: 'affiliate', action: 'cta_clicked', label: 'start_trading' })
      toggleAffiliateModal()
      return
    }
    if (!account) {
      toggleWalletModal()
      analytics.sendEvent({ category: 'affiliate', action: 'cta_clicked', label: 'connect_to_verify' })
      return
    }
    verifyCode(codeInput, account)
  }, [
    account,
    analytics,
    codeInput,
    isVerifying,
    savedCode,
    toggleAffiliateModal,
    toggleWalletModal,
    verifyCode,
    walletStatus,
  ])

  return (
    <AffiliateTradeCodeForm
      walletStatus={walletStatus}
      account={account}
      requiresPayoutConfirmation={!!account && !savedCode && !isSupportedPayoutsNetwork(chainId)}
      codeInfo={codeInfo}
      payoutConfirmed={payoutConfirmed}
      onTogglePayoutConfirmed={onTogglePayoutConfirmed}
      value={codeInput}
      onChange={onChange}
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
