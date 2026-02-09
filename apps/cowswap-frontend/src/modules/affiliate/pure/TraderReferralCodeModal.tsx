import { ReactNode } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletChainId } from '@cowprotocol/wallet-provider'

import { useToggleWalletModal } from 'legacy/state/application/hooks'

import { useNavigate } from 'common/hooks/useNavigate'
import { CowModal } from 'common/pure/Modal'

import { TraderReferralCodeModalContent } from './TraderReferralCodeModal/TraderReferralCodeModalContent'
import { useTraderReferralCodeModalController } from './TraderReferralCodeModal/useTraderReferralCodeModalController'

import { useTraderReferralCodeActions } from '../hooks/useTraderReferralCodeActions'
import { useTraderReferralCodeModalState } from '../hooks/useTraderReferralCodeModalState'
import { isSupportedReferralNetwork } from '../lib/affiliateProgramUtils'

export function TraderReferralCodeModal(): ReactNode {
  const modalState = useTraderReferralCodeModalState()
  const actions = useTraderReferralCodeActions()
  const toggleWalletModal = useToggleWalletModal()
  const { account } = useWalletInfo()
  const chainId = useWalletChainId()
  const navigate = useNavigate()
  const analytics = useCowAnalytics()
  const supportedNetwork = chainId === undefined ? true : isSupportedReferralNetwork(chainId)

  const controller = useTraderReferralCodeModalController({
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
      isOpen={controller.traderReferralCode.modalOpen}
      onDismiss={controller.handleClose}
      initialFocusRef={controller.initialFocusRef}
      padding="0"
      maxHeight={90}
    >
      <TraderReferralCodeModalContent {...controller.contentProps} onDismiss={controller.handleClose} />
    </CowModal>
  )
}
