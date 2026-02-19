import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { FormEvent, useCallback } from 'react'

import { useToggleAffiliateModal } from './useToggleAffiliateModal'

import { formatRefCode } from '../lib/affiliateProgramUtils'
import { affiliateTraderAtom, payoutAddressConfirmationAtom } from '../state/affiliateTraderAtom'
import {
  removeTraderReferralCodeAtom,
  saveTraderReferralCodeAtom,
  setTraderReferralCodeInputAtom,
} from '../state/affiliateTraderWriteAtoms'

interface TraderReferralCodeHandlers {
  onClose(): void
  onRemove(): void
  onSave(): void
  onChange(event: FormEvent<HTMLInputElement>): void
}

export function useTraderReferralCodeHandlers(): TraderReferralCodeHandlers {
  const affiliateTrader = useAtomValue(affiliateTraderAtom)
  const onClose = useToggleAffiliateModal()
  const setInputCode = useSetAtom(setTraderReferralCodeInputAtom)
  const saveCode = useSetAtom(saveTraderReferralCodeAtom)
  const removeCode = useSetAtom(removeTraderReferralCodeAtom)

  const onRemove = useCallback(() => {
    removeCode()
  }, [removeCode])

  const onSave = useCallback(() => {
    const refCode = affiliateTrader.codeInput ? formatRefCode(affiliateTrader.codeInput) : undefined
    if (!refCode) {
      return
    }

    saveCode(affiliateTrader.codeInput)
  }, [affiliateTrader.codeInput, saveCode])

  const onChange = useCallback(
    (event: FormEvent<HTMLInputElement>) => {
      setInputCode(event.currentTarget.value)
    },
    [setInputCode],
  )

  return {
    onClose,
    onRemove,
    onSave,
    onChange,
  }
}

export function usePayoutAddressConfirmation(account?: string): {
  payoutAddressConfirmed: boolean
  togglePayoutAddressConfirmed(checked: boolean): void
} {
  const [payoutAddressConfirmationByWallet, setPayoutAddressConfirmationByWallet] =
    useAtom(payoutAddressConfirmationAtom)
  const normalizedAccount = account?.toLowerCase()
  const payoutAddressConfirmed = normalizedAccount ? !!payoutAddressConfirmationByWallet[normalizedAccount] : false

  const togglePayoutAddressConfirmed = useCallback(
    (checked: boolean) => {
      if (!normalizedAccount) return
      setPayoutAddressConfirmationByWallet((prev) => ({ ...prev, [normalizedAccount]: checked }))
    },
    [normalizedAccount, setPayoutAddressConfirmationByWallet],
  )

  return { payoutAddressConfirmed, togglePayoutAddressConfirmed }
}
