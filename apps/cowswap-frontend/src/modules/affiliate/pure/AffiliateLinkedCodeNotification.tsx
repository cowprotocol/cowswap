import { ReactNode } from 'react'

import { UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import { Link } from 'react-router'
import styled from 'styled-components/macro'

import { Routes } from 'common/constants/routes'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  color: inherit;
`

const Title = styled.div`
  font-size: 16px;
  font-weight: 700;
`

const Body = styled.div`
  font-size: 15px;
  line-height: 1.25;

  strong {
    font-weight: 700;
  }
`

const RewardsLink = styled(Link)`
  width: fit-content;
  color: inherit;
  font-size: 15px;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: opacity ${UI.ANIMATION_DURATION} ease-in-out;

  &:hover {
    opacity: 0.8;
  }
`

export interface AffiliateLinkedCodeNotificationProps {
  code: string
  timeCapDays: number
}

export function AffiliateLinkedCodeNotification({
  code,
  timeCapDays,
}: AffiliateLinkedCodeNotificationProps): ReactNode {
  return (
    <Wrapper>
      <Title>
        <Trans>Rewards activated</Trans>
      </Title>
      <Body>
        <Trans>
          Code <strong>{code}</strong> is linked for the next {timeCapDays} days
        </Trans>
      </Body>
      <RewardsLink to={Routes.ACCOUNT_AFFILIATE_TRADER}>
        <Trans>View rewards</Trans>
      </RewardsLink>
    </Wrapper>
  )
}
