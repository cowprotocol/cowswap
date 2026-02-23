import { useAtomValue, useSetAtom } from 'jotai'
import { type FormEvent, type ReactNode, useCallback, useMemo, useState } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletChainId } from '@cowprotocol/wallet-provider'

import { t } from '@lingui/core/macro'

import { useToggleWalletModal } from 'legacy/state/application/hooks'

import { useAffiliateTraderCodeFromUrl } from '../hooks/useAffiliateTraderCodeFromUrl'
import { useAffiliateTraderInfo } from '../hooks/useAffiliateTraderInfo'
import { useAffiliateTraderVerification } from '../hooks/useAffiliateTraderVerification'
import { TraderWalletStatus, useAffiliateTraderWallet } from '../hooks/useAffiliateTraderWallet'
import { isSupportedPayoutsNetwork } from '../lib/affiliateProgramUtils'
import { AffiliateTradeCodeForm } from '../pure/AffiliateTraderModal/AffiliateTradeCodeForm'
import { toggleTraderModalAtom } from '../state/affiliateTraderModalAtom'
import {
  affiliateTraderPayoutConfirmationAtom,
  setAffiliateTraderPayoutConfirmationAtom,
} from '../state/affiliateTraderPayoutConfirmationAtom'
import { affiliateTraderSavedCodeAtom, setAffiliateTraderSavedCodeAtom } from '../state/affiliateTraderSavedCodeAtom'

// eslint-disable-next-line max-lines-per-function
export function AffiliateTraderModalCodeLinking(): ReactNode {
  const { account } = useWalletInfo()
  const chainId = useWalletChainId()
  const analytics = useCowAnalytics()
  const toggleWalletModal = useToggleWalletModal()
  const toggleAffiliateModal = useSetAtom(toggleTraderModalAtom)

  const { walletStatus } = useAffiliateTraderWallet()
  const { savedCode } = useAtomValue(affiliateTraderSavedCodeAtom)
  const payoutConfirmed = useAtomValue(affiliateTraderPayoutConfirmationAtom)

  const setSavedCode = useSetAtom(setAffiliateTraderSavedCodeAtom)
  const setPayoutConfirmed = useSetAtom(setAffiliateTraderPayoutConfirmationAtom)

  const [codeInput, setCodeInput] = useState<string>(savedCode ?? '')
  const [error, setError] = useState<string | undefined>(undefined)

  useAffiliateTraderCodeFromUrl({ savedCode, setError, setCodeInput })

  const { isVerifying, verifyCode } = useAffiliateTraderVerification({ setError })
  const { data: codeInfo } = useAffiliateTraderInfo(savedCode)

  const onChange = useCallback((event: FormEvent<HTMLInputElement>): void => {
    setCodeInput(event.currentTarget.value.trim().toUpperCase())
    setError(undefined)
  }, [])

  const onEdit = useCallback((): void => {
    setSavedCode(undefined)
    setCodeInput(savedCode ?? '')
    setError(undefined)
  }, [savedCode, setSavedCode])

  const onRemove = useCallback((): void => {
    setSavedCode(undefined)
    setCodeInput('')
    setError(undefined)
  }, [setSavedCode])

  const onTogglePayoutConfirmed = useCallback(
    (checked: boolean): void => {
      setPayoutConfirmed(checked)
    },
    [setPayoutConfirmed],
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
      requiresPayoutConfirmation={!!account && !!chainId && !isSupportedPayoutsNetwork(chainId)}
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
