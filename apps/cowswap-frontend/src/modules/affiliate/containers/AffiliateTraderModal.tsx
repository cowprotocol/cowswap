import { useAtomValue, useSetAtom } from 'jotai'
import { ReactNode, useEffect, useRef } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { ModalHeader } from '@cowprotocol/ui'

import { CowModal } from 'common/pure/Modal'

import { AffiliateTraderModalCodeInfo } from './AffiliateTraderModalCodeInfo'
import { AffiliateTraderModalCodeLinking } from './AffiliateTraderModalCodeLinking'
import { AffiliateTraderModalIneligible } from './AffiliateTraderModalIneligible'
import { AffiliateTraderModalUnsupported } from './AffiliateTraderModalUnsupported'

import { useAffiliateTraderRecoverySideEffect } from '../hooks/useAffiliateTraderRecoverySideEffect'
import { useAffiliateTraderRefUrlSideEffect } from '../hooks/useAffiliateTraderRefUrlSideEffect'
import { TraderWalletStatus, useAffiliateTraderWallet } from '../hooks/useAffiliateTraderWallet'
import { ModalContainer } from '../pure/AffiliateTraderModal/styles'
import { UnsupportedNetwork } from '../pure/UnsupportedNetwork'
import { affiliateTraderModalAtom, toggleTraderModalAtom } from '../state/affiliateTraderModalAtom'

export function AffiliateTraderModal(): ReactNode {
  useAffiliateTraderRecoverySideEffect()
  useAffiliateTraderRefUrlSideEffect()

  const isModalOpen = useAtomValue(affiliateTraderModalAtom)
  const toggleAffiliateModal = useSetAtom(toggleTraderModalAtom)
  const { walletStatus } = useAffiliateTraderWallet()

  const analytics = useCowAnalytics()
  const wasOpenRef = useRef(false)
  useEffect(() => {
    if (isModalOpen && !wasOpenRef.current) {
      analytics.sendEvent({
        category: 'affiliate',
        action: 'modal_opened',
        label: 'modal',
      })
    }

    wasOpenRef.current = isModalOpen
  }, [analytics, isModalOpen])

  return (
    <>
      {isModalOpen && walletStatus === TraderWalletStatus.UNSUPPORTED && <UnsupportedNetwork />}
      <CowModal isOpen={isModalOpen} onDismiss={toggleAffiliateModal} padding="0" maxHeight={90}>
        <ModalContainer>
          <ModalHeader onBack={toggleAffiliateModal} />
          {walletStatus === TraderWalletStatus.UNSUPPORTED ? (
            <AffiliateTraderModalUnsupported />
          ) : walletStatus === TraderWalletStatus.LINKED ? (
            <AffiliateTraderModalCodeInfo />
          ) : walletStatus === TraderWalletStatus.INELIGIBLE ? (
            <AffiliateTraderModalIneligible />
          ) : (
            <AffiliateTraderModalCodeLinking />
          )}
        </ModalContainer>
      </CowModal>
    </>
  )
}
