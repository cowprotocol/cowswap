import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { affiliateTraderAtom } from '../state/affiliateTraderAtom'
import { closeTraderReferralCodeModalAtom, openTraderReferralCodeModalAtom } from '../state/affiliateTraderWriteAtoms'

export function useToggleAffiliateModal(): () => void {
  const { modalOpen } = useAtomValue(affiliateTraderAtom)

  const openModal = useSetAtom(openTraderReferralCodeModalAtom)
  const closeModal = useSetAtom(closeTraderReferralCodeModalAtom)

  return useCallback(() => {
    if (modalOpen) {
      closeModal()
    } else {
      openModal()
    }
  }, [closeModal, modalOpen, openModal])
}
