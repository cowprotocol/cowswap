import type { ReactElement } from 'react'

import { Media, UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { REFERRAL_HOW_IT_WORKS_URL } from 'modules/affiliate/config/constants'

import { Card, ExtLink } from 'pages/Account/styled'

export type BadgeTone = 'neutral' | 'info' | 'success' | 'error'

export const RewardsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

export const RewardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;

  ${Media.upToMedium()} {
    grid-template-columns: 1fr;
  }
`

export const RewardsThreeColumnGrid = styled(RewardsGrid)`
  grid-template-columns: minmax(0, 2fr) minmax(0, 2.5fr) minmax(0, 1.5fr);

  ${Media.upToMedium()} {
    grid-template-columns: 1fr;
  }
`

export const HeroCard = styled(Card)`
  max-width: 520px;
  align-items: center;
  justify-content: center;
  text-align: center;
`

export const HeroContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
`

export const HeroTitle = styled.h2`
  margin: 0;
  width: 100%;
  padding: 0 10px;
  font-size: 28px;
  font-weight: 600;
  color: var(${UI.COLOR_TEXT});
  text-align: center;

  ${Media.upToSmall()} {
    font-size: 24px;
    max-width: 100%;
  }
`

export const HeroSubtitle = styled.p`
  margin: 0;
  width: 100%;
  font-size: 15px;
  line-height: 1.5;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  text-align: center;

  ${Media.upToSmall()} {
    font-size: 14px;
    max-width: 90%;
  }

  a {
    color: var(${UI.COLOR_LINK});
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`

export const HeroActions = styled.div`
  display: flex;
  justify-content: center;
  min-width: 320px;
`

export const Separator = styled.span`
  opacity: 0.6;
`

const LinksRow = styled.div<{ $align: 'inline' | 'center' }>`
  display: ${({ $align }) => ($align === 'center' ? 'flex' : 'inline-flex')};
  align-items: center;
  justify-content: ${({ $align }) => ($align === 'center' ? 'center' : 'flex-start')};
  gap: 8px;
  width: ${({ $align }) => ($align === 'center' ? '100%' : 'auto')};
  font-size: 12px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

export function ReferralTermsFaqLinks({ align = 'inline' }: { align?: 'inline' | 'center' }): ReactElement {
  return (
    <LinksRow $align={align}>
      <ExtLink href="https://cow.fi/legal/cowswap-terms" target="_blank" rel="noopener noreferrer">
        <Trans>Terms</Trans>
      </ExtLink>
      <Separator>•</Separator>
      <ExtLink href={REFERRAL_HOW_IT_WORKS_URL} target="_blank" rel="noopener noreferrer">
        <Trans>FAQ</Trans>
      </ExtLink>
    </LinksRow>
  )
}

export const InlineNote = styled.p`
  margin: 0;
  font-size: 12px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

export const CardStack = styled(Card)`
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
`

export const RewardsCol1Card = styled(CardStack)`
  grid-column: 1 / 2;
  grid-row: 1;

  ${Media.upToMedium()} {
    grid-column: 1 / -1;
    grid-row: auto;
  }
`

export const RewardsCol2Card = styled(CardStack)`
  grid-column: 2 / 3;
  grid-row: 1;
  min-height: 320px;

  ${Media.upToMedium()} {
    grid-column: 1 / -1;
    grid-row: auto;
    min-height: unset;
  }
`

export const RewardsCol3Card = styled(CardStack)`
  grid-column: 3 / 4;
  grid-row: 1;
  min-height: 140px;
  align-items: flex-start;

  ${Media.upToMedium()} {
    grid-column: 1 / -1;
    grid-row: auto;
    min-height: unset;
  }
`

export const CardHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

export const CardTitle = styled.h4`
  margin: 0;
  font-size: 16px;
  color: var(${UI.COLOR_TEXT});
  font-weight: 600;
`

export const LinkedHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`

export const CodeBadge = styled.span`
  padding: 6px 12px;
  border-radius: 999px;
  background: var(${UI.COLOR_PAPER_DARKER});
  color: var(${UI.COLOR_TEXT});
  font-weight: 600;
  font-size: 14px;
`

export const Badge = styled.span<{ $tone: BadgeTone }>`
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ $tone }) => {
    switch ($tone) {
      case 'success':
        return `var(${UI.COLOR_SUCCESS_BG})`
      case 'error':
        return `var(${UI.COLOR_DANGER_BG})`
      case 'info':
        return `var(${UI.COLOR_PRIMARY_OPACITY_10})`
      default:
        return `var(${UI.COLOR_PAPER_DARKER})`
    }
  }};
  color: ${({ $tone }) => {
    switch ($tone) {
      case 'success':
        return `var(${UI.COLOR_SUCCESS_TEXT})`
      case 'error':
        return `var(${UI.COLOR_DANGER_TEXT})`
      case 'info':
        return `var(${UI.COLOR_INFO})`
      default:
        return `var(${UI.COLOR_TEXT})`
    }
  }};
`

export const InfoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

export const InfoItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});

  > span:last-child {
    color: var(${UI.COLOR_TEXT});
  }
`

export const InlineActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`

export const MetricsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 32px;
  width: 100%;
`

export const MetricsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

export const MetricItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 13px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});

  strong {
    color: var(${UI.COLOR_TEXT});
    font-size: 16px;
  }
`

export const MetaRow = styled.p`
  margin: 0;
  font-size: 12px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

export const ClaimValue = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: var(${UI.COLOR_TEXT});
`

export const Donut = styled.div<{ $value: number }>`
  --size: 90px;
  --thickness: 10px;
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  background: conic-gradient(var(${UI.COLOR_INFO}) ${({ $value }) => $value}%, var(${UI.COLOR_TEXT_OPACITY_10}) 0);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex: 0 0 auto;

  &::after {
    content: '';
    width: calc(var(--size) - var(--thickness) * 2);
    height: calc(var(--size) - var(--thickness) * 2);
    border-radius: 50%;
    background: var(${UI.COLOR_PAPER});
    position: absolute;
    z-index: 0;
  }

  > div {
    position: relative;
    z-index: 1;
    font-size: 12px;
    font-weight: 600;
    color: var(${UI.COLOR_TEXT});
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    text-align: center;

    small {
      font-size: 10px;
      color: var(${UI.COLOR_TEXT_OPACITY_70});
      font-weight: 500;
    }
  }
`

export const DonutValue = styled.div``

export const RewardsMetricsRow = styled(MetricsRow)`
  justify-content: space-between;

  ${Media.upToMedium()} {
    flex-direction: column;
    align-items: flex-start;
  }
`

export const RewardsMetricsList = styled(MetricsList)`
  flex: 1 1 auto;
  width: 100%;
  max-width: 420px;
`

export const RewardsMetricItem = styled(MetricItem)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  strong {
    text-align: right;
    white-space: nowrap;
  }
`

export const RewardsDonut = styled(Donut)`
  --size: 139px;
  --thickness: 20px;
  box-shadow: 0px 2.67px 5.33px 0px rgba(0, 0, 0, 0.12) inset;

  ${Media.upToMedium()} {
    --size: 169px;
    --thickness: 18px;
    margin: 0 auto;
  }

  ${DonutValue} {
    > span {
      font-size: 28px;
    }

    small {
      font-size: 12px;
    }
  }
`
