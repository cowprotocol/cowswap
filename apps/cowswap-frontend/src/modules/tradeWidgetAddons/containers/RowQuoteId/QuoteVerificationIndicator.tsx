import { type ReactNode } from 'react'

import { HoverTooltip, UI } from '@cowprotocol/ui'

import { Trans, useLingui } from '@lingui/react/macro'
import { BiCheckShield } from 'react-icons/bi'
import styled from 'styled-components/macro'

interface BaseQuoteVerificationProps {
  isVerified?: boolean | null
}

const VERIFICATION_ICON_VIEW_BOX = '2 1.5 20 21'

const CompactIconTooltip = styled(HoverTooltip)`
  > div {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 0;
  }
`

const VerificationIcon = styled(BiCheckShield).attrs({ viewBox: VERIFICATION_ICON_VIEW_BOX })<{ $isVerified: boolean }>`
  --size: 13px;
  display: block;
  width: var(--size);
  height: var(--size);
  color: ${({ $isVerified }) => ($isVerified ? `var(${UI.COLOR_SUCCESS})` : `var(${UI.COLOR_TEXT_OPACITY_70})`)};
  flex-shrink: 0;
`

const VerificationBadge = styled.span<{ $isVerified: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: 999px;
  padding: 2px 7px;
  letter-spacing: 0.2px;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.6;
  background: ${({ $isVerified }) => ($isVerified ? `var(${UI.COLOR_SUCCESS_BG})` : `var(${UI.COLOR_PAPER_DARKEST})`)};
  color: ${({ $isVerified }) => ($isVerified ? `var(${UI.COLOR_SUCCESS_TEXT})` : `var(${UI.COLOR_TEXT_OPACITY_70})`)};
`

const VerificationLabel = styled.span`
  white-space: nowrap;
  font-size: inherit;
  line-height: inherit;
`

const CompactIconWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
  vertical-align: middle;
`

function getVerificationTooltipText(isVerified: boolean): ReactNode {
  return isVerified ? (
    <Trans>Quote verified by CoW Protocol simulation</Trans>
  ) : (
    <Trans>Quote not yet verified by CoW Protocol simulation</Trans>
  )
}

export function QuoteVerificationIcon({ isVerified }: BaseQuoteVerificationProps): ReactNode {
  const isVerifiedState = !!isVerified

  return (
    <CompactIconTooltip wrapInContainer content={getVerificationTooltipText(isVerifiedState)}>
      <CompactIconWrapper>
        <VerificationIcon $isVerified={isVerifiedState} />
      </CompactIconWrapper>
    </CompactIconTooltip>
  )
}

export function QuoteVerificationBadge({ isVerified }: BaseQuoteVerificationProps): ReactNode {
  const { t } = useLingui()
  const isVerifiedState = !!isVerified

  return (
    <HoverTooltip wrapInContainer content={getVerificationTooltipText(isVerifiedState)}>
      <VerificationBadge $isVerified={isVerifiedState}>
        <VerificationIcon $isVerified={isVerifiedState} />
        <VerificationLabel>{isVerifiedState ? t`Verified` : t`Unverified`}</VerificationLabel>
      </VerificationBadge>
    </HoverTooltip>
  )
}
