import { useCallback, useMemo } from 'react'

import EARN_AS_TRADER_ILLUSTRATION from '@cowprotocol/assets/images/earn-as-trader.svg'
import { PAGE_TITLES } from '@cowprotocol/common-const'
import { ButtonPrimary, ButtonSecondary, Media, UI } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Trans } from '@lingui/react/macro'
import { useLingui } from '@lingui/react/macro'
import { ArrowLeft } from 'react-feather'
import styled from 'styled-components/macro'

import { useToggleWalletModal } from 'legacy/state/application/hooks'

import { REFERRAL_HOW_IT_WORKS_URL, useReferral, useReferralActions } from 'modules/affiliate'
import { Illustration } from 'modules/affiliate/components/ReferralCodeModal/styles'
import { PageTitle } from 'modules/application/containers/PageTitle'

import { useNavigateBack } from 'common/hooks/useNavigate'
import { Card, ExtLink } from 'pages/Account/styled'

const DEFAULT_REWARDS_TARGET = 50_000

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, max-lines-per-function
export default function AccountMyRewards() {
  const { i18n } = useLingui()
  const { account } = useWalletInfo()
  const toggleWalletModal = useToggleWalletModal()
  const referral = useReferral()
  const referralActions = useReferralActions()
  const navigateBack = useNavigateBack()

  const isConnected = Boolean(account)
  const isIneligible = referral.wallet.status === 'ineligible' && isConnected
  const isLinked = referral.wallet.status === 'linked'
  const traderCode = isLinked
    ? referral.wallet.code
    : (referral.savedCode ?? (referral.verification.kind === 'valid' ? referral.verification.code : undefined))
  const traderHasCode = Boolean(traderCode)
  const incomingIneligibleCode = useMemo(() => {
    if (referral.incomingCode) {
      return referral.incomingCode
    }

    if (referral.verification.kind === 'ineligible') {
      return referral.verification.code
    }

    return undefined
  }, [referral.incomingCode, referral.verification])

  const rewardsProgress = 0
  const rewardsProgressPercent = Math.min(100, Math.round((rewardsProgress / DEFAULT_REWARDS_TARGET) * 100))
  const linkedSinceLabel = '--'
  const rewardsEndLabel = '--'

  const handleOpenRewardsModal = useCallback(() => {
    referralActions.openModal('rewards')
  }, [referralActions])

  const handleConnect = useCallback(() => {
    toggleWalletModal()
  }, [toggleWalletModal])

  const handleGoBack = useCallback(() => {
    navigateBack()
  }, [navigateBack])

  return (
    <RewardsWrapper>
      <PageTitle title={i18n._(PAGE_TITLES.MY_REWARDS)} />

      {isIneligible ? (
        <IneligibleCard>
          <IneligibleHeader>
            <BackButton type="button" onClick={handleGoBack} aria-label="Go back">
              <ArrowLeft size={20} />
            </BackButton>
          </IneligibleHeader>
          <Illustration src={EARN_AS_TRADER_ILLUSTRATION} alt="" role="presentation" />

          <IneligibleTitle>
            <Trans>Your wallet is ineligible</Trans>
          </IneligibleTitle>
          <IneligibleSubtitle>
            {incomingIneligibleCode ? (
              <>
                <Trans>
                  The code <strong>{incomingIneligibleCode}</strong> from your link wasn't applied because this wallet
                  has already traded on CoW Swap.
                </Trans>{' '}
                <Trans>Referral rewards are for new wallets only.</Trans>{' '}
              </>
            ) : (
              <>
                <Trans>
                  This wallet has already traded on CoW Swap. Referral rewards are for new wallets only.
                </Trans>{' '}
              </>
            )}
            <ExtLink href={REFERRAL_HOW_IT_WORKS_URL} target="_blank" rel="noopener noreferrer">
              <Trans>How it works</Trans>
            </ExtLink>
          </IneligibleSubtitle>
          <IneligibleActions>
            <ButtonPrimary onClick={handleGoBack}>
              <Trans>Go back</Trans>
            </ButtonPrimary>
          </IneligibleActions>
        </IneligibleCard>
      ) : !traderHasCode ? (
        <HeroCard>
          <HeroContent>
            <Illustration src={EARN_AS_TRADER_ILLUSTRATION} alt="" role="presentation" />
            <HeroTitle>
              <Trans>Earn while you trade</Trans>
            </HeroTitle>
            <HeroSubtitle>
              <Trans>Use a referral code to earn 10 USDC for every $50k in eligible volume within 90 days.</Trans>
            </HeroSubtitle>
            <NoticeBlock>
              <Trans>New wallets only.</Trans>
            </NoticeBlock>
            {!isConnected ? (
              <ButtonPrimary onClick={handleConnect}>
                <Trans>Connect wallet</Trans>
              </ButtonPrimary>
            ) : (
              <ButtonPrimary onClick={handleOpenRewardsModal}>
                <Trans>Add code</Trans>
              </ButtonPrimary>
            )}
            <HeroLinks>
              <ExtLink href="https://cow.fi/legal/cowswap-terms" target="_blank" rel="noopener noreferrer">
                <Trans>Terms</Trans>
              </ExtLink>
              <Separator>•</Separator>
              <ExtLink href={REFERRAL_HOW_IT_WORKS_URL} target="_blank" rel="noopener noreferrer">
                <Trans>FAQ</Trans>
              </ExtLink>
            </HeroLinks>
          </HeroContent>
        </HeroCard>
      ) : (
        <>
          <RewardsGrid>
            <CardStack>
              <Header>
                <Title>{isLinked ? <Trans>Active referral code</Trans> : <Trans>Referral code</Trans>}</Title>
              </Header>
              <LinkedHeader>
                <CodeBadge>{traderCode}</CodeBadge>
                {isLinked ? (
                  <Badge $tone="success">
                    <Trans>Linked</Trans>
                  </Badge>
                ) : (
                  <Badge $tone="info">
                    <Trans>Pending</Trans>
                  </Badge>
                )}
              </LinkedHeader>
              <InfoList>
                <InfoItem>
                  <span>
                    <Trans>Linked since</Trans>
                  </span>
                  <span>{isLinked ? linkedSinceLabel : '--'}</span>
                </InfoItem>
                <InfoItem>
                  <span>
                    <Trans>Rewards end</Trans>
                  </span>
                  <span>{isLinked ? rewardsEndLabel : '--'}</span>
                </InfoItem>
              </InfoList>
              <InlineActions>
                <ButtonSecondary onClick={handleOpenRewardsModal}>
                  <Trans>Edit code</Trans>
                </ButtonSecondary>
              </InlineActions>
            </CardStack>

            <CardStack>
              <CardHeader>
                <CardTitle>
                  <Trans>Next $10 reward</Trans>
                </CardTitle>
              </CardHeader>
              <MetricsRow>
                <Donut $value={rewardsProgressPercent}>
                  <DonutValue>
                    <span>{`$${rewardsProgress.toLocaleString()}`}</span>
                    <small>
                      <Trans>of</Trans> ${DEFAULT_REWARDS_TARGET.toLocaleString()}
                    </small>
                  </DonutValue>
                </Donut>
                <MetricsList>
                  <MetricItem>
                    <span>
                      <Trans>Eligible volume</Trans>
                    </span>
                    <strong>${rewardsProgress.toLocaleString()}</strong>
                  </MetricItem>
                  <MetricItem>
                    <span>
                      <Trans>Goal</Trans>
                    </span>
                    <strong>${DEFAULT_REWARDS_TARGET.toLocaleString()}</strong>
                  </MetricItem>
                </MetricsList>
              </MetricsRow>
            </CardStack>

            <CardStack>
              <CardHeader>
                <CardTitle>
                  <Trans>Claimable rewards</Trans>
                </CardTitle>
              </CardHeader>
              <ClaimValue>0 USDC</ClaimValue>
              <SmallNote>
                <Trans>Paid weekly via airdrop.</Trans>
              </SmallNote>
            </CardStack>
          </RewardsGrid>

          <FullWidthCard>
            <Content>
              <Header>
                <Title>
                  <Trans>Rewards activity</Trans>
                </Title>
                <Subtitle>
                  <Trans>Track completed rewards over time.</Trans>
                </Subtitle>
              </Header>
              <RewardsTable>
                <thead>
                  <tr>
                    <th>
                      <Trans>Trade</Trans>
                    </th>
                    <th>
                      <Trans>Date</Trans>
                    </th>
                    <th>
                      <Trans>Eligible volume</Trans>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={3}>
                      <EmptyTableState>
                        <Trans>Your rewards activity will show here.</Trans>
                      </EmptyTableState>
                    </td>
                  </tr>
                </tbody>
              </RewardsTable>
            </Content>
          </FullWidthCard>
        </>
      )}
    </RewardsWrapper>
  )
}

type BadgeTone = 'neutral' | 'info' | 'success' | 'error'

const RewardsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const RewardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;

  ${Media.upToMedium()} {
    grid-template-columns: 1fr;
  }
`

const HeroCard = styled(Card)`
  max-width: 520px;
  margin: 0 auto;
  align-items: center;
  justify-content: center;
  text-align: center;
`

const HeroContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
`

const IneligibleCard = styled(Card)`
  max-width: 640px;
  margin: 0 auto;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 20px;
  position: relative;
`

const IneligibleHeader = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-start;
`

const BackButton = styled.button`
  border: none;
  background: transparent;
  color: var(${UI.COLOR_TEXT});
  padding: 4px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover,
  &:focus-visible {
    background: var(${UI.COLOR_PAPER_DARKER});
  }
`

const IneligibleTitle = styled.h3`
  margin: 0;
  font-size: 22px;
  color: var(${UI.COLOR_TEXT});
`

const IneligibleSubtitle = styled.p`
  margin: 0;
  font-size: 14px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  max-width: 520px;

  strong {
    color: var(${UI.COLOR_TEXT});
  }
`

const IneligibleActions = styled.div`
  width: 100%;

  ${ButtonPrimary} {
    width: 100%;
  }
`

const HeroTitle = styled.h3`
  margin: 0;
  font-size: 22px;
  color: var(${UI.COLOR_TEXT});
`

const HeroSubtitle = styled.p`
  margin: 0;
  font-size: 14px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

const HeroLinks = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

const Separator = styled.span`
  opacity: 0.6;
`

const Content = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const Title = styled.h3`
  margin: 0;
  font-size: 20px;
  color: var(${UI.COLOR_TEXT});
`

const Subtitle = styled.p`
  margin: 0;
  font-size: 14px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

const NoticeBlock = styled.p`
  margin: 0;
  font-size: 14px;
  color: var(${UI.COLOR_TEXT});
`

const FullWidthCard = styled(Card)`
  grid-column: 1 / -1;
  align-items: flex-start;
`

const CardStack = styled(Card)`
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
`

const CardHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const CardTitle = styled.h4`
  margin: 0;
  font-size: 16px;
  color: var(${UI.COLOR_TEXT});
`

const LinkedHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`

const CodeBadge = styled.span`
  padding: 6px 12px;
  border-radius: 999px;
  background: var(${UI.COLOR_PAPER_DARKER});
  color: var(${UI.COLOR_TEXT});
  font-weight: 600;
  font-size: 14px;
`

const Badge = styled.span<{ $tone: BadgeTone }>`
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

const InfoList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const InfoItem = styled.div`
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

const InlineActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`

const MetricsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
`

const MetricsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const MetricItem = styled.div`
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

const ClaimValue = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: var(${UI.COLOR_TEXT});
`

const SmallNote = styled.p`
  margin: 0;
  font-size: 12px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

const RewardsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  color: var(${UI.COLOR_TEXT});

  th,
  td {
    padding: 10px 0;
    border-bottom: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
    text-align: left;
  }

  th {
    font-size: 12px;
    color: var(${UI.COLOR_TEXT_OPACITY_70});
  }
`

const EmptyTableState = styled.div`
  padding: 16px 0;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

const Donut = styled.div<{ $value: number }>`
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
  }

  > div {
    position: relative;
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

const DonutValue = styled.div``
