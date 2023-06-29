import { ReactNode } from 'react'

import { Trans } from '@lingui/macro'
import { CheckCircle, UserCheck } from 'react-feather'

import { Wrapper } from './styled'
import { UpperSection } from './styled'
import { CloseIconWrapper } from './styled'
import { WalletIcon } from './styled'
import { LowerSection } from './styled'
import { StepsWrapper } from './styled'
import { StepsIconWrapper } from './styled'

interface ConfirmationPendingContentProps {
  onDismiss: () => void
  statusIcon: ReactNode
  title: string | ReactNode
  description: string | ReactNode
  operationSubmittedMessage: string
  operationLabel: string
  walletNameLabel?: string
  walletAddress?: string
}

export function ConfirmationPendingContent({
  onDismiss,
  statusIcon,
  title,
  description,
  operationSubmittedMessage,
  operationLabel,
  walletNameLabel = 'wallet',
  walletAddress,
}: ConfirmationPendingContentProps) {
  return (
    <Wrapper>
      <UpperSection>
        <CloseIconWrapper onClick={onDismiss} />
        <WalletIcon>{statusIcon}</WalletIcon>
        <span>{title}</span>
      </UpperSection>
      <LowerSection>
        <h3>
          <span>{description}</span>
        </h3>

        <StepsWrapper>
          <div>
            <StepsIconWrapper>
              <UserCheck />
            </StepsIconWrapper>
            <p>
              <Trans>
                Sign the {operationLabel} with your {walletNameLabel}. {walletAddress && <span>{walletAddress}</span>}
              </Trans>
            </p>
          </div>
          <hr />
          <div>
            <StepsIconWrapper>
              <CheckCircle />
            </StepsIconWrapper>
            <p>{operationSubmittedMessage}</p>
          </div>
        </StepsWrapper>
      </LowerSection>
    </Wrapper>
  )
}
