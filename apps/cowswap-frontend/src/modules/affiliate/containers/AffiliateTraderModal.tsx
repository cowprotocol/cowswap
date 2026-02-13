import { useAtomValue } from 'jotai'
import { ReactNode } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletChainId } from '@cowprotocol/wallet-provider'

import { useToggleWalletModal } from 'legacy/state/application/hooks'

import { useNavigate } from 'common/hooks/useNavigate'
import { CowModal } from 'common/pure/Modal'

import { useAffiliateTraderModalController } from '../hooks/useAffiliateTraderModalController'
import { useAffiliateTraderModalState } from '../hooks/useAffiliateTraderModalState'
import { useAffiliateTraderVerification } from '../hooks/useAffiliateTraderVerification'
import { TraderWalletStatus, useAffiliateTraderWallet } from '../hooks/useAffiliateTraderWallet'
import { AffiliateTraderModalContent } from '../pure/AffiliateTraderModal/AffiliateTraderModalContent'
import { UnsupportedNetwork } from '../pure/UnsupportedNetwork'
import { affiliateTraderAtom } from '../state/affiliateTraderAtom'

export function AffiliateTraderModal(): ReactNode {
  const affiliateTrader = useAtomValue(affiliateTraderAtom)
  const toggleWalletModal = useToggleWalletModal()
  const { account } = useWalletInfo()
  const chainId = useWalletChainId()
  const navigate = useNavigate()
  const analytics = useCowAnalytics()

  const { walletStatus, supportedNetwork } = useAffiliateTraderWallet({
    account,
    chainId,
    savedCode: affiliateTrader.savedCode,
  })
  const modalState = useAffiliateTraderModalState(walletStatus)

  const { runVerification, cancelVerification } = useAffiliateTraderVerification({
    account,
    chainId,
    supportedNetwork,
    traderReferralCode: modalState,
    analytics,
    toggleWalletModal,
  })

  const controller = useAffiliateTraderModalController({
    modalState,
    account,
    chainId,
    supportedNetwork,
    toggleWalletModal,
    navigate,
    analytics,
    runVerification,
    cancelVerification,
  })

  return (
    <>
      {modalState.modalOpen && walletStatus === TraderWalletStatus.UNSUPPORTED && <UnsupportedNetwork />}
      <CowModal
        isOpen={controller.modalState.modalOpen}
        onDismiss={controller.handleClose}
        initialFocusRef={controller.initialFocusRef}
        padding="0"
        maxHeight={90}
      >
        <AffiliateTraderModalContent {...controller.contentProps} onDismiss={controller.handleClose} />
      </CowModal>
    </>
  )
}
