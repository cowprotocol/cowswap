import type { ReactNode } from 'react'

import CheckIcon from '@cowprotocol/assets/cow-swap/order-check.svg'
import EARN_AS_TRADER_ILLUSTRATION from '@cowprotocol/assets/images/earn-as-trader.svg'
import LockedIcon from '@cowprotocol/assets/images/icon-locked-2.svg'
import { ButtonPrimary, UI } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

import {
  BottomMetaRow,
  CardTitle,
  Donut,
  DonutValue,
  HeroActions,
  HeroCard,
  HeroContent,
  HeroSubtitle,
  HeroTitle,
  IneligibleCard,
  IneligibleSubtitle,
  IneligibleTitle,
  LinkedBadge,
  LinkedCard,
  LinkedCodeRow,
  LinkedCodeText,
  LinkedMetaList,
  MetricItem,
  NextPayoutCard,
  RewardsCol1Card,
  RewardsCol2Card,
  RewardsHeader,
  RewardsMetricsList,
  RewardsMetricsRow,
  RewardsThreeColumnGrid,
  RewardsWrapper,
  UnsupportedNetworkCard,
  UnsupportedNetworkHeader,
  UnsupportedNetworkMessage,
  ValidStatusBadge,
} from './shared'

const Frame = styled.div`
  width: 100%;
  min-height: 100vh;
  padding: 32px 16px 64px;
  background: ${({ theme }) => (theme.darkMode ? '#0E0F2D' : `var(${UI.COLOR_BLUE_300_PRIMARY})`)};
`

function AddCodeState(): ReactNode {
  return (
    <Frame>
      <RewardsWrapper>
        <HeroCard>
          <HeroContent>
            <img src={EARN_AS_TRADER_ILLUSTRATION} alt="" role="presentation" />
            <HeroTitle>Earn while you trade</HeroTitle>
            <HeroSubtitle>Use a referral code to earn a flat fee for eligible volume through the app.</HeroSubtitle>
            <HeroActions>
              <ButtonPrimary onClick={() => alert('Add code')}>Add code</ButtonPrimary>
            </HeroActions>
          </HeroContent>
        </HeroCard>
      </RewardsWrapper>
    </Frame>
  )
}

function LinkedCodeState(): ReactNode {
  return (
    <Frame>
      <RewardsWrapper>
        <RewardsThreeColumnGrid>
          <RewardsCol1Card>
            <RewardsHeader>
              <CardTitle>Active referral code</CardTitle>
            </RewardsHeader>
            <LinkedCard>
              <LinkedCodeRow>
                <LinkedCodeText>COWPARTNER</LinkedCodeText>
                <LinkedBadge>
                  <SVG src={LockedIcon} width={12} height={10} />
                  Linked
                </LinkedBadge>
              </LinkedCodeRow>
            </LinkedCard>
            <LinkedMetaList>
              <MetricItem>
                <span>Linked since</span>
                <strong>Jan 12, 2026</strong>
              </MetricItem>
              <MetricItem>
                <span>Rewards end</span>
                <strong>Apr 12, 2026</strong>
              </MetricItem>
            </LinkedMetaList>
          </RewardsCol1Card>

          <RewardsCol2Card>
            <CardTitle>Next $10 reward</CardTitle>
            <RewardsMetricsRow>
              <RewardsMetricsList>
                <MetricItem>
                  <span>Left to next $10</span>
                  <strong>$1,250</strong>
                </MetricItem>
                <MetricItem>
                  <span>Total earned</span>
                  <strong>120 USDC</strong>
                </MetricItem>
                <MetricItem>
                  <span>Received</span>
                  <strong>40 USDC</strong>
                </MetricItem>
              </RewardsMetricsList>
              <Donut $value={87}>
                <DonutValue>
                  <span>$8,750</span>
                  <small>of $10,000</small>
                </DonutValue>
              </Donut>
            </RewardsMetricsRow>
            <BottomMetaRow>
              <span title="Rewards data updates every 6 hours at 00:00, 06:00, 12:00, 18:00 (UTC) and take about one hour to appear here.">
                Last updated: ~2 hours ago
              </span>
            </BottomMetaRow>
          </RewardsCol2Card>

          <NextPayoutCard payoutLabel="20 USDC" />
        </RewardsThreeColumnGrid>
      </RewardsWrapper>
    </Frame>
  )
}

function ValidNotLinkedState(): ReactNode {
  return (
    <Frame>
      <RewardsWrapper>
        <RewardsThreeColumnGrid>
          <RewardsCol1Card>
            <RewardsHeader>
              <CardTitle>Referral code</CardTitle>
            </RewardsHeader>
            <LinkedCard>
              <LinkedCodeRow>
                <LinkedCodeText>VALIDCODE</LinkedCodeText>
                <ValidStatusBadge>
                  <SVG src={CheckIcon} width={12} height={10} />
                  Valid
                </ValidStatusBadge>
              </LinkedCodeRow>
            </LinkedCard>
            <HeroActions>
              <ButtonPrimary onClick={() => alert('Edit code')}>Edit code</ButtonPrimary>
            </HeroActions>
          </RewardsCol1Card>
          <RewardsCol2Card>
            <CardTitle>Next $10 reward</CardTitle>
            <RewardsMetricsRow>
              <RewardsMetricsList>
                <MetricItem>
                  <span>Left to next $10</span>
                  <strong>$10,000</strong>
                </MetricItem>
              </RewardsMetricsList>
            </RewardsMetricsRow>
          </RewardsCol2Card>
          <NextPayoutCard payoutLabel="0 USDC" />
        </RewardsThreeColumnGrid>
      </RewardsWrapper>
    </Frame>
  )
}

function UnsupportedNetworkState(): ReactNode {
  return (
    <Frame>
      <RewardsWrapper>
        <UnsupportedNetworkCard>
          <UnsupportedNetworkHeader>Switch network</UnsupportedNetworkHeader>
          <UnsupportedNetworkMessage>
            Please connect your wallet to one of our supported networks.
          </UnsupportedNetworkMessage>
        </UnsupportedNetworkCard>
      </RewardsWrapper>
    </Frame>
  )
}

function IneligibleState(): ReactNode {
  return (
    <Frame>
      <RewardsWrapper>
        <IneligibleCard>
          <img src={EARN_AS_TRADER_ILLUSTRATION} alt="" role="presentation" />
          <IneligibleTitle>Your wallet is ineligible</IneligibleTitle>
          <IneligibleSubtitle>This wallet cannot link this referral code. Try another code.</IneligibleSubtitle>
        </IneligibleCard>
      </RewardsWrapper>
    </Frame>
  )
}

const Fixtures = {
  addCodeState: () => <AddCodeState />,
  linkedCodeState: () => <LinkedCodeState />,
  validNotLinkedState: () => <ValidNotLinkedState />,
  unsupportedNetworkState: () => <UnsupportedNetworkState />,
  ineligibleState: () => <IneligibleState />,
}

export default Fixtures
