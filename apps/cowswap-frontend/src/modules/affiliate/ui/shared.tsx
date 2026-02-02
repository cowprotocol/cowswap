import type { ReactElement, ReactNode } from 'react'

import { ButtonPrimary, ButtonSecondary, Font, HelpTooltip, LinkStyledButton, Media, UI } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import styled from 'styled-components/macro'

import { AFFILIATE_HOW_IT_WORKS_URL } from 'modules/affiliate/config/constants'

import { Card, ExtLink } from 'pages/Account/styled'

export type BadgeTone = 'neutral' | 'info' | 'success' | 'error'

export const RewardsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

export const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

export const LabelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`

export const Label = styled.label`
  font-size: 14px;
  color: var(${UI.COLOR_TEXT});
`

export const LabelActions = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`

export const MiniAction = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px 6px;
  border-radius: 999px;
  border: 1px solid var(${UI.COLOR_BORDER});
  background: var(${UI.COLOR_PAPER});
  color: var(${UI.COLOR_TEXT_OPACITY_60});
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  text-transform: lowercase;

  &:hover:not(:disabled) {
    background: var(${UI.COLOR_PAPER_DARKER});
  }

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`

export const HelperText = styled.span`
  font-size: 13px;
  color: var(${UI.COLOR_TEXT_OPACITY_60});
  line-height: 1.5;
  text-align: center;
`

export const InlineError = styled.span`
  font-size: 12px;
  color: var(${UI.COLOR_DANGER_TEXT});
`

export const PrimaryAction = styled(ButtonPrimary)`
  width: 100%;
`

export const RewardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
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
  color: var(${UI.COLOR_TEXT_OPACITY_60});
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
  color: var(${UI.COLOR_TEXT_OPACITY_60});
`

export function AffiliateTermsFaqLinks({ align = 'inline' }: { align?: 'inline' | 'center' }): ReactElement {
  return (
    <LinksRow $align={align}>
      <ExtLink href="https://cow.fi/legal/cowswap-terms" target="_blank" rel="noopener noreferrer">
        <Trans>Terms</Trans>
      </ExtLink>
      <Separator>•</Separator>
      <ExtLink href={AFFILIATE_HOW_IT_WORKS_URL} target="_blank" rel="noopener noreferrer">
        <Trans>FAQ</Trans>
      </ExtLink>
    </LinksRow>
  )
}

export const InlineNote = styled.p`
  margin: 0;
  font-size: 12px;
  color: var(${UI.COLOR_TEXT_OPACITY_60});
`

export const CardStack = styled(Card)`
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
`

export const RewardsCol1Card = styled(CardStack)`
  grid-column: 1 / 2;
  grid-row: 1;
  align-items: center;

  ${Media.upToMedium()} {
    grid-column: 1 / -1;
    grid-row: auto;
  }
`

export const RewardsCol2Card = styled(CardStack)`
  grid-column: 2 / 3;
  grid-row: 1;

  ${Media.upToMedium()} {
    grid-column: 1 / -1;
    grid-row: auto;
    min-height: unset;
  }
`

export const RewardsCol3Card = styled(CardStack)`
  grid-column: 3 / 4;
  grid-row: 1;
  align-items: center;

  ${Media.upToMedium()} {
    grid-column: 1 / -1;
    grid-row: auto;
    min-height: unset;
  }
`

export const CardTitle = styled.h4`
  margin: 0;
  font-size: 16px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  font-weight: 600;
`

export const LinkedCard = styled.div`
  border: 1px solid var(${UI.COLOR_INFO_BG});
  background: var(${UI.COLOR_PAPER});
  border-radius: 9px;
  overflow: hidden;
  width: 100%;
`

export const LinkedCodeRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  background: var(${UI.COLOR_INFO_BG});
  color: var(${UI.COLOR_INFO_TEXT});
`

export const LinkedCodeText = styled.span`
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  font-size: 18px;
  white-space: nowrap;
  color: inherit;
  font-family: ${Font.familyMono};
`

export const LinkedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  font-size: 14px;
`

export const LinkedMetaList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  width: 100%;
`

export const RewardsHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

export const ValidStatusBadge = styled(LinkedBadge)`
  color: var(${UI.COLOR_SUCCESS_TEXT});

  svg {
    fill: currentColor;
  }
`

export const LinkedCopy = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`

export const LinkedLinkRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px 12px;
  color: var(${UI.COLOR_TEXT_OPACITY_60});
  border-top: 1px solid var(${UI.COLOR_BORDER});
`

export const LinkedLinkText = styled.span`
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const LinkedActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
`

export const LinkedFooter = styled.div`
  margin-top: auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`

export const LinkedActionButton = styled(ButtonSecondary)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  border-radius: 12px;
  border: 1px solid var(${UI.COLOR_BORDER});
  background: var(${UI.COLOR_PAPER});
  color: var(${UI.COLOR_TEXT});
  font-weight: 600;
  font-size: 14px;
  padding: 8px 14px;
  // min-height: 36px;
`

export const LinkedActionIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: inherit;
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
  color: var(${UI.COLOR_TEXT_OPACITY_60});

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

export const MetaRow = styled.div`
  margin: 0;
  font-size: 12px;
  color: var(${UI.COLOR_TEXT_OPACITY_60});
  display: inline-flex;
  align-items: center;
  gap: 6px;

  span[title] {
    cursor: help;
  }
`

export const IneligibleCard = styled(Card)`
  max-width: 520px;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 20px;
  position: relative;
`

export const IneligibleTitle = styled.h3`
  margin: 0;
  font-size: 22px;
  color: var(${UI.COLOR_TEXT});
`

export const IneligibleSubtitle = styled.p`
  margin: 0;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  max-width: 520px;

  strong {
    color: var(${UI.COLOR_TEXT});
  }
`

export const UnsupportedNetworkCard = styled(Card)`
  min-height: 300px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
`

export const UnsupportedNetworkHeader = styled.h3`
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  color: var(${UI.COLOR_DANGER});
`

export const UnsupportedNetworkMessage = styled.p`
  margin: 0;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

export const LinkedFooterNote = styled(MetaRow)`
  width: 100%;
  justify-content: center;
  text-align: center;
`

export const StatusText = styled.p<{ $variant: 'error' | 'success' }>`
  margin: 0;
  font-size: 14px;
  color: ${({ $variant }) => ($variant === 'error' ? `var(${UI.COLOR_DANGER_TEXT})` : `var(${UI.COLOR_SUCCESS_TEXT})`)};
`

export const PayoutValue = styled.div`
  font-size: 26px;
  font-weight: 600;
  color: var(${UI.COLOR_TEXT});
  display: flex;
  align-items: center;
  gap: 12px;
`

export const BottomMetaRow = styled(MetaRow)`
  margin-top: auto;
`

const USDC_LOGO_URL = 'https://files.cow.fi/token-lists/images/1/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48/logo.png'

const TitleWithTooltip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
`

const PayoutNote = styled(InlineNote)`
  margin-top: auto;
`

type NextPayoutCardProps = {
  payoutLabel: ReactNode
  showLoader?: boolean
}

export function NextPayoutCard({ payoutLabel, showLoader = false }: NextPayoutCardProps): ReactElement {
  return (
    <RewardsCol3Card showLoader={showLoader}>
      <CardTitle>
        <TitleWithTooltip>
          <span>
            <Trans>Next payout</Trans>
          </span>
          <HelpTooltip
            text={t`The amount you should expect to receive at the next payout, if no further volume is generated.`}
          />
        </TitleWithTooltip>
      </CardTitle>
      <PayoutValue>
        <img src={USDC_LOGO_URL} height={36} width={36} alt="" role="presentation" />
        {payoutLabel}
      </PayoutValue>
      <PayoutNote>
        <Trans>Paid weekly via airdrop.</Trans>
      </PayoutNote>
    </RewardsCol3Card>
  )
}

export const DonutValue = styled.div``

const DonutRing = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
  z-index: 0;
  --radius: calc(50 - var(--stroke-width) / 2);

  circle {
    fill: none;
    stroke-width: var(--stroke-width);
    cx: 50;
    cy: 50;
    r: var(--radius);
  }

  .donut-track {
    stroke: var(${UI.COLOR_TEXT_OPACITY_10});
  }

  .donut-progress {
    stroke: var(${UI.COLOR_INFO});
    stroke-linecap: round;
    stroke-dasharray: 100;
    stroke-dashoffset: calc(100 - var(--value));
  }

  .donut-center {
    fill: var(${UI.COLOR_PAPER});
    stroke: none;
    r: calc(50 - var(--stroke-width));
  }
`

const DonutWrapper = styled.div<{ $value: number }>`
  --size: 139px;
  --thickness: 20px;
  --stroke-width: 14.4;
  --value: ${({ $value }) => $value};
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex: 0 0 auto;
  box-shadow: 0px 2.67px 5.33px 0px rgba(0, 0, 0, 0.12) inset;

  ${Media.upToMedium()} {
    --size: 169px;
    --thickness: 18px;
    --stroke-width: 10.6;
    margin: 0 auto;
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
      font-size: 15px;
      color: var(${UI.COLOR_TEXT_OPACITY_60});
      font-weight: 400;
    }
  }

  ${DonutValue} {
    > span {
      font-size: 24px;
    }

    small {
      font-size: 15px;
      font-weight: 400;
    }
  }
`

type DonutProps = {
  $value: number
  children: ReactNode
}

export function Donut({ $value, children }: DonutProps): ReactElement {
  return (
    <DonutWrapper $value={$value}>
      <DonutRing viewBox="0 0 100 100" aria-hidden="true">
        <circle className="donut-track" pathLength="100" />
        <circle className="donut-progress" pathLength="100" />
        <circle className="donut-center" />
      </DonutRing>
      {children}
    </DonutWrapper>
  )
}

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

export const MetricItem = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  font-size: 13px;
  font-weight: 500;
  color: var(${UI.COLOR_TEXT_OPACITY_60});

  strong {
    color: var(${UI.COLOR_TEXT});
    text-align: right;
    white-space: nowrap;
    font-weight: 500;
  }
`

export const LabelContent = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0px;
`

export const HowItWorksLink = styled(LinkStyledButton)`
  color: var(${UI.COLOR_LINK});
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`
