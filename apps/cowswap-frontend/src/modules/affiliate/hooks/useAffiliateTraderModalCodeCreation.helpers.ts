import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { FormEvent, RefObject, useCallback } from 'react'

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
  onEdit(): void
  onRemove(): void
  onSave(): void
  onChange(event: FormEvent<HTMLInputElement>): void
}

export function useTraderReferralCodeHandlers(
  inputRef: RefObject<HTMLInputElement | null>,
): TraderReferralCodeHandlers {
  const affiliateTrader = useAtomValue(affiliateTraderAtom)
  const close = useToggleAffiliateModal()
  const setInputCode = useSetAtom(setTraderReferralCodeInputAtom)
  const saveCode = useSetAtom(saveTraderReferralCodeAtom)
  const removeCode = useSetAtom(removeTraderReferralCodeAtom)

  const onEdit = useCallback(() => {
    setTimeout(() => inputRef.current?.focus(), 0)
  }, [inputRef])

  const onRemove = useCallback(() => {
    removeCode()
    setTimeout(() => inputRef.current?.focus(), 0)
  }, [inputRef, removeCode])

  const onSave = useCallback(() => {
    const refCode = affiliateTrader.code ? formatRefCode(affiliateTrader.code) : undefined
    if (!refCode) {
      return
    }

    saveCode(affiliateTrader.code)
  }, [affiliateTrader.code, saveCode])

  const onChange = useCallback(
    (event: FormEvent<HTMLInputElement>) => {
      setInputCode(event.currentTarget.value)
    },
    [setInputCode],
  )

  return {
    onClose: close,
    onEdit,
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
