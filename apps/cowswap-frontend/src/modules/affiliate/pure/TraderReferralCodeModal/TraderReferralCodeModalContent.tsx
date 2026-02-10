import { ReactNode } from 'react'

import EARN_AS_TRADER_ILLUSTRATION from '@cowprotocol/assets/images/earn-as-trader.svg'
import { ButtonPrimary, ModalHeader } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { Body, Footer, ModalContainer, Subtitle, Title } from './styles'
import { TraderReferralCodeForm } from './TraderReferralCodeForm'
import { TraderReferralCodeModalContentProps } from './TraderReferralCodeModal.types'
import { TraderReferralCodeStatusMessages, getModalTitle } from './TraderReferralCodeStatusMessages'

import { TraderReferralCodeModalUiState } from '../../hooks/useTraderReferralCodeModalState'
import { TraderReferralCodeIncomingReason, TraderReferralCodeVerificationStatus } from '../../lib/affiliateProgramTypes'
import { getPartnerProgramCopyValues } from '../../lib/affiliateProgramUtils'
import { StatusText } from '../shared'
import { TraderReferralCodeHowItWorksLink, TraderReferralCodeIneligibleCopy } from '../TraderReferralCodeIneligibleCopy'

export function TraderReferralCodeModalContent(props: TraderReferralCodeModalContentProps): ReactNode {
  const { uiState, onPrimaryClick, primaryCta, onDismiss, inputRef, ctaRef, hasRejection } = props
  const shouldShowForm = uiState !== 'ineligible'
  const errorMessage = getErrorMessage(uiState, props.verification)

  return (
    <ModalContainer>
      <ModalHeader onBack={onDismiss} />

      <Body>
        <img src={EARN_AS_TRADER_ILLUSTRATION} alt="" role="presentation" />
        <Title>{getModalTitle(uiState, { hasRejection })}</Title>
        <TraderReferralCodeSubtitle
          uiState={uiState}
          hasRejection={hasRejection}
          verification={props.verification}
          incomingIneligibleCode={props.incomingIneligibleCode}
          isConnected={props.isConnected}
          rejectionCode={props.rejectionCode}
          rejectionReason={props.rejectionReason}
          isLinked={props.isLinked}
        />
        {shouldShowForm && (
          <TraderReferralCodeForm
            uiState={uiState}
            isConnected={props.isConnected}
            savedCode={props.savedCode}
            displayCode={props.displayCode}
            verification={props.verification}
            onEdit={props.onEdit}
            onRemove={props.onRemove}
            onSave={props.onSave}
            onChange={props.onChange}
            onPrimaryClick={onPrimaryClick}
            inputRef={inputRef}
          />
        )}
        {errorMessage ? <StatusText $variant="error">{errorMessage}</StatusText> : null}
        <TraderReferralCodeStatusMessages
          infoMessage={props.infoMessage}
          shouldShowInfo={props.shouldShowInfo}
          variant={props.infoVariant}
        />
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

interface TraderReferralCodeSubtitleProps {
  uiState: TraderReferralCodeModalUiState
  hasRejection: boolean
  verification: TraderReferralCodeVerificationStatus
  incomingIneligibleCode?: string
  isConnected: boolean
  rejectionCode?: string
  rejectionReason?: TraderReferralCodeIncomingReason
  isLinked: boolean
}

// eslint-disable-next-line max-lines-per-function
function TraderReferralCodeSubtitle({
  uiState,
  hasRejection,
  verification,
  incomingIneligibleCode,
  isConnected,
  rejectionCode,
  rejectionReason,
  isLinked,
}: TraderReferralCodeSubtitleProps): ReactNode {
  const programParams = verification.kind === 'valid' ? verification.programParams : undefined
  const programCopy = programParams ? getPartnerProgramCopyValues(programParams) : null
  if (isLinked && !hasRejection) {
    return (
      <Subtitle>
        <Trans>Your wallet is already linked to a referral code.</Trans> <TraderReferralCodeHowItWorksLink />
      </Subtitle>
    )
  }

  if (hasRejection && rejectionCode) {
    return (
      <Subtitle>
        <Trans>
          The code <strong>{rejectionCode}</strong> from your link wasn’t applied.
        </Trans>
        {renderRejectionReason(rejectionReason)} <TraderReferralCodeHowItWorksLink />
      </Subtitle>
    )
  }

  if (uiState === 'ineligible') {
    return (
      <Subtitle>
        <TraderReferralCodeIneligibleCopy incomingCode={incomingIneligibleCode} />
      </Subtitle>
    )
  }

  const isPostValidation = uiState === 'valid'

  return (
    <Subtitle>
      {isPostValidation ? (
        <>
          {programCopy ? (
            <Trans>
              Code binds on your first eligible trade. Earn {programCopy.rewardAmount} {programCopy.rewardCurrency} per{' '}
              {programCopy.triggerVolume} eligible volume in {programCopy.timeCapDays} days. Payouts happen on Ethereum
              mainnet.
            </Trans>
          ) : (
            <Trans>
              Code binds on your first eligible trade. Earn rewards for eligible volume within the program window.
              Payouts happen on Ethereum mainnet.
            </Trans>
          )}{' '}
          <TraderReferralCodeHowItWorksLink />
        </>
      ) : (
        <>
          {programCopy ? (
            isConnected ? (
              <Trans>
                Code binds on your first eligible trade. Earn {programCopy.rewardAmount} {programCopy.rewardCurrency}{' '}
                per {programCopy.triggerVolume} eligible volume in {programCopy.timeCapDays} days. Payouts happen on
                Ethereum mainnet.
              </Trans>
            ) : (
              <Trans>
                Connect to verify eligibility. Code binds on your first eligible trade. Earn {programCopy.rewardAmount}{' '}
                {programCopy.rewardCurrency} per {programCopy.triggerVolume} eligible volume in{' '}
                {programCopy.timeCapDays} days. Payouts happen on Ethereum mainnet.
              </Trans>
            )
          ) : isConnected ? (
            <Trans>
              Code binds on your first eligible trade. Earn rewards for eligible volume within the program window.
              Payouts happen on Ethereum mainnet.
            </Trans>
          ) : (
            <Trans>
              Connect to verify eligibility. Code binds on your first eligible trade. Earn rewards for eligible volume
              within the program window. Payouts happen on Ethereum mainnet.
            </Trans>
          )}{' '}
          <TraderReferralCodeHowItWorksLink />
        </>
      )}
    </Subtitle>
  )
}

function renderRejectionReason(reason?: TraderReferralCodeIncomingReason): ReactNode {
  if (!reason) {
    return null
  }

  switch (reason) {
    case 'invalid':
      return (
        <>
          {' '}
          <Trans>It isn't a valid referral code.</Trans>
        </>
      )
    case 'ineligible':
      return (
        <>
          {' '}
          <Trans>This wallet isn't eligible.</Trans>
        </>
      )
    default:
      return null
  }
}
