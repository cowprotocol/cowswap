import { useAtomValue, useSetAtom } from 'jotai'
import { ReactNode, useEffect, useRef } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { ModalHeader } from '@cowprotocol/ui'

import { CowModal } from 'common/pure/Modal'

import { AffiliateTraderModalCodeInfo } from './AffiliateTraderModalCodeInfo'
import { AffiliateTraderModalCodeLinking } from './AffiliateTraderModalCodeLinking'
import { AffiliateTraderModalIneligible } from './AffiliateTraderModalIneligible'
import { AffiliateTraderModalUnsupported } from './AffiliateTraderModalUnsupported'

import {
  getAffiliateModalViewKey,
  getAffiliateTraderModalState,
  trackAffiliateEvent,
} from '../analytics/affiliateAnalytics.utils'
import { useAffiliateStateViewAnalytics } from '../hooks/useAffiliateStateViewAnalytics'
import { useAffiliateTraderRecoverySideEffect } from '../hooks/useAffiliateTraderRecoverySideEffect'
import { useAffiliateTraderRefUrlSideEffect } from '../hooks/useAffiliateTraderRefUrlSideEffect'
import { TraderWalletStatus, useAffiliateTraderWallet } from '../hooks/useAffiliateTraderWallet'
import { ModalContainer } from '../pure/AffiliateTraderModal/styles'
import { UnsupportedNetwork } from '../pure/UnsupportedNetwork'
import { affiliateTraderModalAtom, closeTraderModalAtom } from '../state/affiliateTraderModalAtom'
import { affiliateTraderSavedCodeAtom } from '../state/affiliateTraderSavedCodeAtom'

export function AffiliateTraderModal(): ReactNode {
  const isRecoverySettling = useAffiliateTraderRecoverySideEffect()
  useAffiliateTraderRefUrlSideEffect()

  const analytics = useCowAnalytics()
  const { isOpen: isModalOpen, source: entrySource } = useAtomValue(affiliateTraderModalAtom)
  const closeAffiliateModal = useSetAtom(closeTraderModalAtom)
  const { savedCode, isLinked } = useAtomValue(affiliateTraderSavedCodeAtom)
  const walletStatus = useAffiliateTraderWallet()
  const modalState = getAffiliateTraderModalState(walletStatus)
  const hasTrackedOpenRef = useRef(false)

  useEffect(() => {
    if (!isModalOpen) {
      hasTrackedOpenRef.current = false
      return
    }

    if (hasTrackedOpenRef.current) {
      return
    }

    if (walletStatus === TraderWalletStatus.PENDING || isRecoverySettling) {
      return
    }

    trackAffiliateEvent({
      analytics,
      action: 'affiliate_trader_modal_opened',
      entrySource,
      walletStatus,
      hasSavedCode: !!savedCode,
      isLinked: !!isLinked,
    })
    hasTrackedOpenRef.current = true
  }, [analytics, entrySource, isLinked, isModalOpen, isRecoverySettling, savedCode, walletStatus])

  useAffiliateStateViewAnalytics({
    action: 'affiliate_trader_modal_state_viewed',
    viewKey: getAffiliateModalViewKey(isModalOpen, modalState, walletStatus, entrySource),
    eventParams: {
      modalState,
      walletStatus,
      entrySource,
    },
  })

  return (
    <>
      {isModalOpen && walletStatus === TraderWalletStatus.UNSUPPORTED && <UnsupportedNetwork />}
      <CowModal isOpen={isModalOpen} onDismiss={closeAffiliateModal} padding="0" maxHeight={90}>
        <ModalContainer>
          <ModalHeader onBack={closeAffiliateModal} />
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
