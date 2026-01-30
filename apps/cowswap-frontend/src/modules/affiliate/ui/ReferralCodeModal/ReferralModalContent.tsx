import { ReactNode } from 'react'

import EARN_AS_TRADER_ILLUSTRATION from '@cowprotocol/assets/images/earn-as-trader.svg'
import { ButtonPrimary, ModalHeader } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import { ReferralCodeForm } from './ReferralCodeForm'
import { ReferralStatusMessages, getModalTitle } from './ReferralStatusMessages'
import { Body, Footer, ModalContainer, Subtitle, Title } from './styles'
import { ReferralModalContentProps } from './types'

import { getAffiliateProgramCopyValues } from '../../lib/affiliate-program-utils'
import { ReferralModalUiState } from '../../model/hooks/useReferralModalState'
import { ReferralVerificationStatus } from '../../model/types'
import { ReferralHowItWorksLink, ReferralIneligibleCopy } from '../ReferralIneligibleCopy'

export function ReferralModalContent(props: ReferralModalContentProps): ReactNode {
  const { uiState, onPrimaryClick, primaryCta, onDismiss, inputRef, ctaRef, linkedMessage, hasRejection } = props
  const shouldShowForm = uiState !== 'ineligible'

  const howItWorksLink = <ReferralHowItWorksLink />

  return (
    <ModalContainer>
      <ModalHeader onBack={onDismiss} onClose={onDismiss}>
        {null}
      </ModalHeader>

      <Body>
        <img src={EARN_AS_TRADER_ILLUSTRATION} alt="" role="presentation" />
        <Title>{getModalTitle(uiState, { hasRejection })}</Title>
        <ReferralSubtitle
          uiState={uiState}
          linkedMessage={linkedMessage}
          howItWorksLink={howItWorksLink}
          hasRejection={hasRejection}
          verification={props.verification}
          incomingIneligibleCode={props.incomingIneligibleCode}
        />
        {shouldShowForm && (
          <ReferralCodeForm
            uiState={uiState}
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
        <ReferralStatusMessages infoMessage={props.infoMessage} shouldShowInfo={props.shouldShowInfo} />
      </Body>

      <Footer>
        <ButtonPrimary ref={ctaRef} disabled={primaryCta.disabled} onClick={onPrimaryClick} type="button">
          {primaryCta.label}
        </ButtonPrimary>
      </Footer>
    </ModalContainer>
  )
}

interface ReferralSubtitleProps {
  uiState: ReferralModalUiState
  linkedMessage?: ReactNode
  howItWorksLink: ReactNode
  hasRejection: boolean
  verification: ReferralVerificationStatus
  incomingIneligibleCode?: string
}

function ReferralSubtitle({
  uiState,
  linkedMessage,
  howItWorksLink,
  hasRejection,
  verification,
  incomingIneligibleCode,
}: ReferralSubtitleProps): ReactNode {
  const programParams = verification.kind === 'valid' ? verification.programParams : undefined
  const programCopy = programParams ? getAffiliateProgramCopyValues(programParams) : null
  if ((uiState === 'linked' || hasRejection) && linkedMessage) {
    return (
      <Subtitle>
        {linkedMessage} {howItWorksLink}
      </Subtitle>
    )
  }

  if (uiState === 'ineligible') {
    return (
      <Subtitle>
        <ReferralIneligibleCopy incomingCode={incomingIneligibleCode} />
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
          {howItWorksLink}
        </>
      ) : (
        <>
          {programCopy ? (
            <Trans>
              Connect to verify eligibility. Code binds on your first eligible trade. Earn {programCopy.rewardAmount}{' '}
              {programCopy.rewardCurrency} per {programCopy.triggerVolume} eligible volume in {programCopy.timeCapDays}{' '}
              days. Payouts happen on Ethereum mainnet.
            </Trans>
          ) : (
            <Trans>
              Connect to verify eligibility. Code binds on your first eligible trade. Earn rewards for eligible volume
              within the program window. Payouts happen on Ethereum mainnet.
            </Trans>
          )}{' '}
          {howItWorksLink}
        </>
      )}
    </Subtitle>
  )
}
