import { ReactNode } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletChainId } from '@cowprotocol/wallet-provider'

import { useToggleWalletModal } from 'legacy/state/application/hooks'

import { useNavigate } from 'common/hooks/useNavigate'
import { CowModal } from 'common/pure/Modal'

import { ReferralModalContent } from './ReferralCodeModal/ReferralModalContent'
import { useReferralModalController } from './ReferralCodeModal/useReferralModalController'

import { isSupportedReferralNetwork } from '../api'
import { useReferralActions } from '../model/hooks/useReferralActions'
import { useReferralModalState } from '../model/hooks/useReferralModalState'

export function ReferralCodeModal(): ReactNode {
  const modalState = useReferralModalState()
  const actions = useReferralActions()
  const toggleWalletModal = useToggleWalletModal()
  const { account } = useWalletInfo()
  const chainId = useWalletChainId()
  const navigate = useNavigate()
  const analytics = useCowAnalytics()
  const supportedNetwork = chainId === undefined ? true : isSupportedReferralNetwork(chainId)

  const controller = useReferralModalController({
    modalState,
    actions,
    account,
    supportedNetwork,
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
