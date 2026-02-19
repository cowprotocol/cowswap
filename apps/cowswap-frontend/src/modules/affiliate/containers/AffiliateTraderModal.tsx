import { useAtomValue } from 'jotai'
import { ReactNode, useEffect, useRef } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { ModalHeader } from '@cowprotocol/ui'

import { CowModal } from 'common/pure/Modal'

import { AffiliateTraderModalCodeCreation } from './AffiliateTraderModalCodeCreation'
import { AffiliateTraderModalCodeInfo } from './AffiliateTraderModalCodeInfo'
import { AffiliateTraderModalIneligible } from './AffiliateTraderModalIneligible'
import { AffiliateTraderModalUnsupported } from './AffiliateTraderModalUnsupported'

import { TraderWalletStatus, useAffiliateTraderWallet } from '../hooks/useAffiliateTraderWallet'
import { useToggleAffiliateModal } from '../hooks/useToggleAffiliateModal'
import { ModalContainer } from '../pure/AffiliateTraderModal/styles'
import { UnsupportedNetwork } from '../pure/UnsupportedNetwork'
import { affiliateTraderAtom } from '../state/affiliateTraderAtom'

export function AffiliateTraderModal(): ReactNode {
  const { modalOpen } = useAtomValue(affiliateTraderAtom)
  const { walletStatus } = useAffiliateTraderWallet()
  const toggleAffiliateModal = useToggleAffiliateModal()

  const analytics = useCowAnalytics()
  const wasOpenRef = useRef(false)
  useEffect(() => {
    if (modalOpen && !wasOpenRef.current) {
      analytics.sendEvent({
        category: 'affiliate',
        action: 'modal_opened',
        label: 'modal',
      })
    }

    wasOpenRef.current = modalOpen
  }, [analytics, modalOpen])

  return (
    <>
      {modalOpen && walletStatus === TraderWalletStatus.UNSUPPORTED && <UnsupportedNetwork />}
      <CowModal isOpen={modalOpen} onDismiss={toggleAffiliateModal} padding="0" maxHeight={90}>
        <ModalContainer>
          <ModalHeader onBack={toggleAffiliateModal} />
          {walletStatus === TraderWalletStatus.UNSUPPORTED ? (
            <AffiliateTraderModalUnsupported />
          ) : walletStatus === TraderWalletStatus.LINKED ? (
            <AffiliateTraderModalCodeInfo />
          ) : walletStatus === TraderWalletStatus.INELIGIBLE ? (
            <AffiliateTraderModalIneligible />
          ) : (
            <AffiliateTraderModalCodeCreation />
          )}
        </ModalContainer>
      </CowModal>
    </>
  )
}
