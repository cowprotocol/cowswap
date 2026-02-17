import { FormEvent, ReactNode, useRef, useState } from 'react'

import EARN_AS_AFFILIATE_ILLUSTRATION from '@cowprotocol/assets/images/earn-as-affiliate.svg'
import LockedIcon from '@cowprotocol/assets/images/icon-locked-2.svg'
import { ButtonPrimary, UI } from '@cowprotocol/ui'

import { RotateCw } from 'react-feather'
import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

import { ReferralCodeInputRow } from './ReferralCodeInput/ReferralCodeInputRow'
import {
  AffiliateTermsFaqLinks,
  BottomMetaRow,
  CardTitle,
  Donut,
  DonutValue,
  Form,
  HeroActions,
  HeroCard,
  HeroContent,
  HeroSubtitle,
  HeroTitle,
  InlineError,
  Label,
  LabelActions,
  LabelContent,
  LabelRow,
  LinkedCopy,
  LinkedActionButton,
  LinkedActions,
  LinkedBadge,
  LinkedCard,
  LinkedCodeRow,
  LinkedCodeText,
  LinkedFooter,
  LinkedFooterNote,
  LinkedLinkRow,
  LinkedLinkText,
  MetricItem,
  MiniAction,
  NextPayoutCard,
  PrimaryAction,
  RewardsCol1Card,
  RewardsCol2Card,
  RewardsMetricsList,
  RewardsMetricsRow,
  ThreeColumnGrid,
  PageWrapper,
} from './shared'

const Frame = styled.div`
  width: 100%;
  min-height: 100vh;
  padding: 32px 16px 64px;
  background: ${({ theme }) => (theme.darkMode ? '#0E0F2D' : `var(${UI.COLOR_BLUE_300_PRIMARY})`)};
`

function HeroState(): ReactNode {
  return (
    <Frame>
      <PageWrapper>
        <HeroCard>
          <HeroContent>
            <img src={EARN_AS_AFFILIATE_ILLUSTRATION} alt="" role="presentation" />
            <HeroTitle>Invite your friends and earn rewards</HeroTitle>
            <HeroSubtitle>
              You and your referrals can earn a flat fee for eligible volume done through the app.
            </HeroSubtitle>
            <HeroActions>
              <ButtonPrimary onClick={() => alert('Connect wallet')}>Connect wallet</ButtonPrimary>
            </HeroActions>
            <AffiliateTermsFaqLinks />
          </HeroContent>
        </HeroCard>
      </PageWrapper>
    </Frame>
  )
}

function CreateCodeState(): ReactNode {
  const [code, setCode] = useState('COWFRIEND')
  const inputRef = useRef<HTMLInputElement | null>(null)
  const canSave = code.length >= 5

  const onChange = (event: FormEvent<HTMLInputElement>): void => {
    setCode(event.currentTarget.value.toUpperCase())
  }

  return (
    <Frame>
      <PageWrapper>
        <ThreeColumnGrid>
          <RewardsCol1Card>
            <CardTitle>Create your referral code</CardTitle>
            <BottomMetaRow as="div">
              <Form>
                <LabelRow>
                  <Label htmlFor="affiliate-code-cosmos">
                    <LabelContent>Referral code</LabelContent>
                  </Label>
                  <LabelActions>
                    <MiniAction onClick={() => setCode('COWSWAP')}>
                      generate
                      <RotateCw size={10} strokeWidth={3} />
                    </MiniAction>
                  </LabelActions>
                </LabelRow>
                <ReferralCodeInputRow
                  displayCode={code}
                  hasError={false}
                  isInputDisabled={false}
                  isEditing
                  isLinked={false}
                  trailingIconKind="success"
                  canSubmitSave={canSave}
                  onChange={onChange}
                  onPrimaryClick={() => null}
                  onSave={() => null}
                  inputRef={inputRef}
                  inputId="affiliate-code-cosmos"
                  size="compact"
                />
                {!canSave && <InlineError>Code must be at least 5 characters.</InlineError>}
                <PrimaryAction disabled={!canSave}>Save & lock code</PrimaryAction>
              </Form>
            </BottomMetaRow>
          </RewardsCol1Card>
          <RewardsCol2Card>
            <CardTitle>Your referral traffic</CardTitle>
            <RewardsMetricsRow>
              <RewardsMetricsList>
                <MetricItem>
                  <span>Left to next reward</span>
                  <strong>$10,000</strong>
                </MetricItem>
                <MetricItem>
                  <span>Total earned</span>
                  <strong>-</strong>
                </MetricItem>
              </RewardsMetricsList>
              <Donut $value={0}>
                <DonutValue>
                  <span>$0</span>
                  <small>of $10,000</small>
                </DonutValue>
              </Donut>
            </RewardsMetricsRow>
          </RewardsCol2Card>
          <NextPayoutCard payoutLabel="0 USDC" />
        </ThreeColumnGrid>
      </PageWrapper>
    </Frame>
  )
}

function LinkedState(): ReactNode {
  return (
    <Frame>
      <PageWrapper>
        <ThreeColumnGrid>
          <RewardsCol1Card>
            <CardTitle>Your referral code</CardTitle>
            <LinkedCard>
              <LinkedCodeRow>
                <LinkedCopy>
                  <LinkedCodeText>COWPOWER</LinkedCodeText>
                </LinkedCopy>
                <LinkedBadge>
                  <SVG src={LockedIcon} width={12} height={10} />
                  Created
                </LinkedBadge>
              </LinkedCodeRow>
              <LinkedLinkRow>
                <LinkedLinkText>https://swap.cow.fi?ref=COWPOWER</LinkedLinkText>
              </LinkedLinkRow>
            </LinkedCard>
            <LinkedFooter>
              <LinkedFooterNote>Links/codes do not reveal your wallet.</LinkedFooterNote>
              <LinkedActions>
                <LinkedActionButton as="a" href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                  Share on X
                </LinkedActionButton>
                <LinkedActionButton onClick={() => alert('Open QR modal')}>Download QR</LinkedActionButton>
              </LinkedActions>
            </LinkedFooter>
          </RewardsCol1Card>

          <RewardsCol2Card>
            <CardTitle>Your referral traffic</CardTitle>
            <RewardsMetricsRow>
              <RewardsMetricsList>
                <MetricItem>
                  <span>Left to next reward</span>
                  <strong>$3,500</strong>
                </MetricItem>
                <MetricItem>
                  <span>Total earned</span>
                  <strong>420 USDC</strong>
                </MetricItem>
                <MetricItem>
                  <span>Active referrals</span>
                  <strong>14</strong>
                </MetricItem>
              </RewardsMetricsList>
              <Donut $value={65}>
                <DonutValue>
                  <span>$6,500</span>
                  <small>of $10,000</small>
                </DonutValue>
              </Donut>
            </RewardsMetricsRow>
            <BottomMetaRow>
              <span title="Rewards data updates every 6 hours at 00:00, 06:00, 12:00, 18:00 (UTC) and take about one hour to appear here.">
                Last updated: ~1 hour ago
              </span>
            </BottomMetaRow>
          </RewardsCol2Card>

          <NextPayoutCard payoutLabel="80 USDC" />
        </ThreeColumnGrid>
      </PageWrapper>
    </Frame>
  )
}

const Fixtures = {
  heroState: () => <HeroState />,
  createCodeState: () => <CreateCodeState />,
  linkedState: () => <LinkedState />,
}

export default Fixtures
