import React, { ReactNode } from 'react'

import { useWalletDisplayedAddress } from '@cowprotocol/wallet'

import { Trans } from '@lingui/macro'
import { CheckCircle, UserCheck } from 'react-feather'

import { BackButton } from 'modules/trade/pure/BackButton'

import { Wrapper } from './styled'
import { UpperSection } from './styled'
import { WalletIcon } from './styled'
import { LowerSection } from './styled'
import { StepsWrapper } from './styled'
import { StepsIconWrapper } from './styled'

import { useWalletStatusIcon } from '../../hooks/useWalletStatusIcon'

interface ConfirmationPendingContentProps {
  onDismiss: () => void
  title: string | ReactNode
  description: string | ReactNode
  operationLabel: string
  CustomBody?: ReactNode
  CustomDescription?: ReactNode
}

export function ConfirmationPendingContent({
  title,
  description,
  operationLabel,
  onDismiss,
  CustomBody,
  CustomDescription,
}: ConfirmationPendingContentProps) {
  const walletAddress = useWalletDisplayedAddress()
  const statusIcon = useWalletStatusIcon()

  const operationSubmittedMessage = `The ${operationLabel} is submitted.`

  return (
    <Wrapper>
      <UpperSection>
        <BackButton onClick={onDismiss} />
        <WalletIcon>{statusIcon}</WalletIcon>
        <span>{title}</span>
      </UpperSection>
      <LowerSection>
        <h3>
          <span>
            {CustomDescription || (
              <>
                <span>{description} </span>
                <br />
                <span>
                  <Trans>Follow these steps:</Trans>
                </span>
              </>
            )}
          </span>
        </h3>

        {CustomBody || (
          <StepsWrapper>
            <div>
              <StepsIconWrapper>
                <UserCheck />
              </StepsIconWrapper>
              <p>
                <Trans>
                  Sign the {operationLabel} with your wallet. {walletAddress && <span>{walletAddress}</span>}
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
        )}
      </LowerSection>
    </Wrapper>
  )
}
