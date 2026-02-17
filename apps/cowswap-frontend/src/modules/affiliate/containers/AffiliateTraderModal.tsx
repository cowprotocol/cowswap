import { useAtomValue } from 'jotai'
import { ReactNode } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import EARN_AS_TRADER_ILLUSTRATION from '@cowprotocol/assets/images/earn-as-trader.svg'
import { ButtonPrimary, ModalHeader } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletChainId } from '@cowprotocol/wallet-provider'

import { useToggleWalletModal } from 'legacy/state/application/hooks'

import { useNavigate } from 'common/hooks/useNavigate'
import { CowModal } from 'common/pure/Modal'

import { useAffiliateTraderModalController } from '../hooks/useAffiliateTraderModalController'
import { useAffiliateTraderModalState } from '../hooks/useAffiliateTraderModalState'
import { useAffiliateTraderVerification } from '../hooks/useAffiliateTraderVerification'
import { TraderWalletStatus, useAffiliateTraderWallet } from '../hooks/useAffiliateTraderWallet'
import { TraderReferralCodeModalContentProps } from '../pure/AffiliateTraderModal/AffiliateTraderModal.types'
import { AffiliateTraderSubtitle } from '../pure/AffiliateTraderModal/AffiliateTraderSubtitle'
import { PayoutAddressConfirmation } from '../pure/AffiliateTraderModal/PayoutAddressConfirmation'
import { TraderReferralCodeStatusMessages, getModalTitle } from '../pure/AffiliateTraderModal/StatusMessages'
import { Body, Footer, ModalContainer, Title } from '../pure/AffiliateTraderModal/styles'
import { TraderReferralCodeForm } from '../pure/AffiliateTraderModal/TraderReferralCodeForm'
import { StatusText } from '../pure/shared'
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
        <AffiliateTraderModalView {...controller.contentProps} onDismiss={controller.handleClose} />
      </CowModal>
    </>
  )
}

function AffiliateTraderModalView(props: TraderReferralCodeModalContentProps): ReactNode {
  const { uiState, onDismiss, hasRejection, subtitle, form, status, payout, primaryCta, onPrimaryClick, ctaRef } = props

  return (
    <ModalContainer>
      <ModalHeader onBack={onDismiss} />

      <Body>
        <img src={EARN_AS_TRADER_ILLUSTRATION} alt="" role="presentation" />
        <Title>{getModalTitle(uiState, { hasRejection })}</Title>
        <AffiliateTraderSubtitle {...subtitle} />
        {form.isVisible && (
          <TraderReferralCodeForm
            uiState={form.uiState}
            isConnected={form.isConnected}
            savedCode={form.savedCode}
            displayCode={form.displayCode}
            verificationStatus={form.verificationStatus}
            onEdit={form.onEdit}
            onRemove={form.onRemove}
            onSave={form.onSave}
            onChange={form.onChange}
            onPrimaryClick={onPrimaryClick}
            inputRef={form.inputRef}
          />
        )}
        {subtitle.verificationErrorMessage && (
          <StatusText $variant="error">{subtitle.verificationErrorMessage}</StatusText>
        )}
        <TraderReferralCodeStatusMessages
          infoMessage={status.infoMessage}
          shouldShowInfo={status.shouldShowInfo}
          variant={status.infoVariant}
        />
        {payout.showPayoutAddressConfirmation && payout.payoutAddress && (
          <PayoutAddressConfirmation
            account={payout.payoutAddress}
            checked={payout.payoutAddressConfirmed}
            onToggle={payout.onTogglePayoutAddressConfirmed}
          />
        )}
      </Body>

      <Footer>
        <ButtonPrimary ref={ctaRef} disabled={primaryCta.disabled} onClick={onPrimaryClick} type="button">
          {primaryCta.label}
        </ButtonPrimary>
      </Footer>
    </ModalContainer>
  )
}
