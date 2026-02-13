import { ReactNode } from 'react'

import EARN_AS_TRADER_ILLUSTRATION from '@cowprotocol/assets/images/earn-as-trader.svg'
import { ButtonPrimary, ModalHeader } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'

import { TraderReferralCodeModalContentProps } from './AffiliateTraderModal.types'
import { AffiliateTraderSubtitle } from './AffiliateTraderSubtitle'
import { PayoutAddressConfirmation } from './PayoutAddressConfirmation'
import { TraderReferralCodeStatusMessages, getModalTitle } from './StatusMessages'
import { Body, Footer, ModalContainer, Title } from './styles'
import { TraderReferralCodeForm } from './TraderReferralCodeForm'

import { TraderReferralCodeModalUiState } from '../../hooks/useAffiliateTraderModalState'
import { TraderReferralCodeVerificationStatus } from '../../lib/affiliateProgramTypes'
import { StatusText } from '../shared'

export function AffiliateTraderModalContent(props: TraderReferralCodeModalContentProps): ReactNode {
  const { uiState, onDismiss, hasRejection, subtitle, form, status, payout, primaryCta, onPrimaryClick, ctaRef } = props
  const errorMessage = getErrorMessage(uiState, subtitle.verification)

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
            verification={form.verification}
            onEdit={form.onEdit}
            onRemove={form.onRemove}
            onSave={form.onSave}
            onChange={form.onChange}
            onPrimaryClick={onPrimaryClick}
            inputRef={form.inputRef}
          />
        )}
        {errorMessage ? <StatusText $variant="error">{errorMessage}</StatusText> : null}
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

function getErrorMessage(
  uiState: TraderReferralCodeModalUiState,
  verification: TraderReferralCodeVerificationStatus,
): string | undefined {
  if (uiState !== 'error' || verification.kind !== 'error') {
    return undefined
  }

  return verification.message || t`Unable to verify code`
}
