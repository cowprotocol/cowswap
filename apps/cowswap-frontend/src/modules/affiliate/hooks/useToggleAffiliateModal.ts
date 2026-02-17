import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { openTraderReferralCodeModalAtom } from '../state/affiliateTraderWriteAtoms'

type ToggleAffiliateModal = {
  (): void
}

export function useToggleAffiliateModal(): ToggleAffiliateModal {
  const openModal = useSetAtom(openTraderReferralCodeModalAtom)

  return useCallback(() => {
    openModal()
  }, [openModal])
}
