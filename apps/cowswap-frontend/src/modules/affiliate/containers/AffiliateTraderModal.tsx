import { useAtomValue, useSetAtom } from 'jotai'
import { ReactNode } from 'react'

import { ModalHeader } from '@cowprotocol/ui'

import { CowModal } from 'common/pure/Modal'

import { AffiliateTraderModalCodeInfo } from './AffiliateTraderModalCodeInfo'
import { AffiliateTraderModalCodeLinking } from './AffiliateTraderModalCodeLinking'
import { AffiliateTraderModalIneligible } from './AffiliateTraderModalIneligible'
import { AffiliateTraderModalUnsupported } from './AffiliateTraderModalUnsupported'

import {
  getAffiliateModalOpenViewKey,
  getAffiliateModalViewKey,
  getAffiliateTraderModalState,
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
  useAffiliateTraderRecoverySideEffect()
  useAffiliateTraderRefUrlSideEffect()

  const { isOpen: isModalOpen, source: entrySource } = useAtomValue(affiliateTraderModalAtom)
  const closeAffiliateModal = useSetAtom(closeTraderModalAtom)
  const { savedCode, isLinked } = useAtomValue(affiliateTraderSavedCodeAtom)
  const walletStatus = useAffiliateTraderWallet()
  const modalState = getAffiliateTraderModalState(walletStatus)

  useAffiliateStateViewAnalytics({
    action: 'affiliate_trader_modal_opened',
    viewKey: getAffiliateModalOpenViewKey(isModalOpen, walletStatus, entrySource, !!savedCode, !!isLinked),
    eventParams: {
      entrySource,
      walletStatus,
      hasSavedCode: !!savedCode,
      isLinked: !!isLinked,
    },
  })

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
