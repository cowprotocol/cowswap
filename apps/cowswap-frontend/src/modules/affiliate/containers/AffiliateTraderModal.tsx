import { useAtomValue, useSetAtom } from 'jotai'
import { ReactNode, useEffect, useRef } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { ModalHeader } from '@cowprotocol/ui'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'
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
import { affiliateTraderModalAtom, toggleTraderModalAtom } from '../state/affiliateTraderModalAtom'
import { affiliateTraderSavedCodeAtom } from '../state/affiliateTraderSavedCodeAtom'

export function AffiliateTraderModal(): ReactNode {
  const isRecoverySettling = useAffiliateTraderRecoverySideEffect()
  useAffiliateTraderRefUrlSideEffect()

  const isModalOpen = useAtomValue(affiliateTraderModalAtom)
  const toggleAffiliateModal = useSetAtom(toggleTraderModalAtom)
  const { savedCode, isLinked } = useAtomValue(affiliateTraderSavedCodeAtom)
  const walletStatus = useAffiliateTraderWallet()

  const analytics = useCowAnalytics()
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
      walletStatus,
      hasSavedCode: !!savedCode,
      isLinked: !!isLinked,
    })
    hasTrackedOpenRef.current = true
  }, [analytics, isLinked, isModalOpen, isRecoverySettling, savedCode, walletStatus])

  useAffiliateStateViewAnalytics({
    action: 'affiliate_trader_modal_state_viewed',
    viewKey: getAffiliateModalViewKey(isModalOpen, modalState, walletStatus),
    eventParams: {
      modalState,
      walletStatus,
    },
  })

  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()
  const showAffiliateBanner = walletStatus === TraderWalletStatus.UNSUPPORTED && !isProviderNetworkUnsupported

  return (
    <>
      {isModalOpen && showAffiliateBanner && <UnsupportedNetwork />}
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
