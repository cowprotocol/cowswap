import { ReactNode } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useToggleWalletModal } from 'legacy/state/application/hooks'

import { useNavigate } from 'common/hooks/useNavigate'
import { CowModal } from 'common/pure/Modal'

import { ReferralModalContent } from './ReferralCodeModal/content'
import { useReferralModalController } from './ReferralCodeModal/controller'

import { useReferralActions } from '../hooks/useReferralActions'
import { useReferralModalState } from '../hooks/useReferralModalState'

export function ReferralCodeModal(): ReactNode {
  const modalState = useReferralModalState()
  const actions = useReferralActions()
  const toggleWalletModal = useToggleWalletModal()
  const { account } = useWalletInfo()
  const navigate = useNavigate()
  const analytics = useCowAnalytics()

  const controller = useReferralModalController({
    modalState,
    actions,
    account,
    toggleWalletModal,
    navigate,
    analytics,
  })

  return (
    <CowModal
      isOpen={controller.referral.modalOpen}
      onDismiss={controller.handleClose}
      initialFocusRef={controller.initialFocusRef}
      padding="0"
      maxHeight={90}
    >
      <ReferralModalContent {...controller.contentProps} onDismiss={controller.handleClose} />
    </CowModal>
  )
}
