import { ReactNode } from 'react'

import EARN_AS_TRADER_ILLUSTRATION from '@cowprotocol/assets/images/earn-as-trader.svg'
import { ButtonPrimary, ModalHeader } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import { Body, Footer, ModalContainer, Subtitle, Title } from './styles'
import { TraderReferralCodeForm } from './TraderReferralCodeForm'
import { TraderReferralCodeStatusMessages, getModalTitle } from './TraderReferralCodeStatusMessages'
import { TraderReferralCodeModalContentProps } from './types'

import { getPartnerProgramCopyValues } from '../../lib/affiliate-program-utils'
import { TraderReferralCodeModalUiState } from '../../model/hooks/useTraderReferralCodeModalState'
import { TraderReferralCodeVerificationStatus } from '../../model/partner-trader-types'
import { TraderReferralCodeHowItWorksLink, TraderReferralCodeIneligibleCopy } from '../TraderReferralCodeIneligibleCopy'

export function TraderReferralCodeModalContent(props: TraderReferralCodeModalContentProps): ReactNode {
  const { uiState, onPrimaryClick, primaryCta, onDismiss, inputRef, ctaRef, linkedMessage, hasRejection } = props
  const shouldShowForm = uiState !== 'ineligible'

  return (
    <ModalContainer>
      <ModalHeader onBack={onDismiss} onClose={onDismiss}>
        {null}
      </ModalHeader>

      <Body>
        <img src={EARN_AS_TRADER_ILLUSTRATION} alt="" role="presentation" />
        <Title>{getModalTitle(uiState, { hasRejection })}</Title>
        <TraderReferralCodeSubtitle
          uiState={uiState}
          linkedMessage={linkedMessage}
          hasRejection={hasRejection}
          verification={props.verification}
          incomingIneligibleCode={props.incomingIneligibleCode}
          isConnected={props.isConnected}
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
        <TraderReferralCodeStatusMessages infoMessage={props.infoMessage} shouldShowInfo={props.shouldShowInfo} />
      </Body>

      <Footer>
        <ButtonPrimary ref={ctaRef} disabled={primaryCta.disabled} onClick={onPrimaryClick} type="button">
          {primaryCta.label}
        </ButtonPrimary>
      </Footer>
    </ModalContainer>
  )
}

interface TraderReferralCodeSubtitleProps {
  uiState: TraderReferralCodeModalUiState
  linkedMessage?: ReactNode
  hasRejection: boolean
  verification: TraderReferralCodeVerificationStatus
  incomingIneligibleCode?: string
  isConnected: boolean
}

function TraderReferralCodeSubtitle({
  uiState,
  linkedMessage,
  hasRejection,
  verification,
  incomingIneligibleCode,
  isConnected,
}: TraderReferralCodeSubtitleProps): ReactNode {
  const programParams = verification.kind === 'valid' ? verification.programParams : undefined
  const programCopy = programParams ? getPartnerProgramCopyValues(programParams) : null
  if ((uiState === 'linked' || hasRejection) && linkedMessage) {
    return (
      <Subtitle>
        {linkedMessage} <TraderReferralCodeHowItWorksLink />
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
