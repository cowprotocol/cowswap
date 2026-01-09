import { ReactNode } from 'react'

import REFERRAL_ILLUSTRATION from '@cowprotocol/assets/images/image-profit.svg'
import { ButtonPrimary, LinkStyledButton, ModalHeader } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import { ReferralCodeForm } from './ReferralCodeForm'
import { ReferralStatusMessages, getModalTitle } from './ReferralStatusMessages'
import { Body, Footer, HelperText, Illustration, ModalContainer, Subtitle, Title } from './styles'
import { ReferralModalContentProps } from './types'

import { REFERRAL_HOW_IT_WORKS_URL } from '../../constants'
import { ReferralModalUiState } from '../../hooks/useReferralModalState'

export function ReferralModalContent(props: ReferralModalContentProps): ReactNode {
  const { uiState, onPrimaryClick, helperText, primaryCta, onDismiss, inputRef, ctaRef, linkedMessage, hasRejection } =
    props

  const howItWorksLink = (
    <LinkStyledButton as="a" href={REFERRAL_HOW_IT_WORKS_URL} target="_blank" rel="noopener noreferrer">
      <Trans>How it works.</Trans>
    </LinkStyledButton>
  )

  return (
    <ModalContainer>
      <ModalHeader onBack={onDismiss} onClose={onDismiss}>
        {null}
      </ModalHeader>

      <Body>
        <Illustration src={REFERRAL_ILLUSTRATION} alt="" role="presentation" />
        <Title>{getModalTitle(uiState, { hasRejection })}</Title>
        <ReferralSubtitle
          uiState={uiState}
          linkedMessage={linkedMessage}
          howItWorksLink={howItWorksLink}
          hasRejection={hasRejection}
        />
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
        <ReferralStatusMessages infoMessage={props.infoMessage} shouldShowInfo={props.shouldShowInfo} />
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
  linkedMessage?: ReactNode
  howItWorksLink: ReactNode
  hasRejection: boolean
}

function ReferralSubtitle({ uiState, linkedMessage, howItWorksLink, hasRejection }: ReferralSubtitleProps): ReactNode {
  if ((uiState === 'linked' || hasRejection) && linkedMessage) {
    return (
      <Subtitle>
        {linkedMessage} {howItWorksLink}
      </Subtitle>
    )
  }

  const isPostValidation = uiState === 'valid'

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
