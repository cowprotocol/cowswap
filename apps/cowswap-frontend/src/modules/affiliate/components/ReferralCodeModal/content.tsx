import { ReactNode } from 'react'

import { ButtonPrimary, LinkStyledButton, ModalHeader } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'

import { ReferralCodeForm } from './ReferralCodeForm'
import { ReferralStatusMessages, getModalTitle } from './ReferralStatusMessages'
import { Body, Footer, HelperText, Illustration, ModalContainer, Subtitle } from './styles'
import { ReferralModalContentProps } from './types'

import { REFERRAL_HOW_IT_WORKS_URL } from '../../constants'
import { ReferralModalUiState } from '../../hooks/useReferralModalState'

export function ReferralModalContent(props: ReferralModalContentProps): ReactNode {
  const { uiState, onPrimaryClick, helperText, primaryCta, onDismiss, inputRef, ctaRef } = props

  const howItWorksLink = (
    <LinkStyledButton as="a" href={REFERRAL_HOW_IT_WORKS_URL} target="_blank" rel="noopener noreferrer">
      <Trans>How it works.</Trans>
    </LinkStyledButton>
  )

  return (
    <ModalContainer>
      <ModalHeader onBack={onDismiss} onClose={onDismiss}>
        {getModalTitle(uiState)}
      </ModalHeader>

      <Body>
        <Illustration>&lt; illustration &gt;</Illustration>
        <ReferralSubtitle uiState={uiState} howItWorksLink={howItWorksLink} />
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
        <ReferralStatusMessages
          uiState={uiState}
          verification={props.verification}
          invalidMessage={props.invalidMessage}
          expiredMessage={props.expiredMessage}
          errorMessage={props.errorMessage}
          linkedMessage={props.linkedMessage}
          ineligibleMessage={props.ineligibleMessage}
          infoMessage={props.infoMessage}
          shouldShowInfo={props.shouldShowInfo}
          howItWorksLink={howItWorksLink}
        />
      </Body>

      <Footer>
        <ButtonPrimary ref={ctaRef} disabled={primaryCta.disabled} onClick={onPrimaryClick} type="button">
          {primaryCta.label}
        </ButtonPrimary>

        {helperText && <HelperText>{helperText}</HelperText>}
      </Footer>
    </ModalContainer>
  )
}

interface ReferralSubtitleProps {
  uiState: ReferralModalUiState
  howItWorksLink: ReactNode
}

function ReferralSubtitle({ uiState, howItWorksLink }: ReferralSubtitleProps): ReactNode {
  const isPostValidation = uiState === 'valid' || uiState === 'linked'

  return (
    <Subtitle>
      {isPostValidation ? (
        <>
          <Trans>Code binds on your first eligible trade. Earn 10 USDC per 50k eligible volume in 90 days.</Trans>{' '}
          {howItWorksLink}
        </>
      ) : (
        <>
          <Trans>
            Connect to verify eligibility. Code binds on your first eligible trade. Earn 10 USDC per 50k eligible volume
            in 90 days.
          </Trans>{' '}
          {howItWorksLink}
        </>
      )}
    </Subtitle>
  )
}
