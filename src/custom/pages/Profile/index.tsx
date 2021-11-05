import styled, { css } from 'styled-components/macro'
import { Txt } from 'assets/styles/styled'
import {
  FlexCol,
  FlexWrap,
  Wrapper,
  GridWrap,
  CardHead,
  StyledTitle,
  StyledTime,
  ItemTitle,
  ChildWrapper,
} from 'pages/Profile/styled'
import { useActiveWeb3React } from 'hooks/web3'
import Copy from 'components/Copy/CopyMod'
import { HelpCircle, RefreshCcw } from 'react-feather'
import Web3Status from 'components/Web3Status'
import useReferralLink from 'hooks/useReferralLink'
import useFetchProfile from 'hooks/useFetchProfile'
import { numberFormatter } from 'utils/format'
import useTimeAgo from 'hooks/useTimeAgo'
import { MouseoverTooltipContent } from 'components/Tooltip'
import NotificationBanner from 'components/NotificationBanner'
import { SupportedChainId as ChainId } from 'constants/chains'

export default function Profile() {
  const referralLink = useReferralLink()
  const { account, chainId } = useActiveWeb3React()
  const { profileData, isLoading } = useFetchProfile()
  const lastUpdated = useTimeAgo(profileData?.lastUpdated)

  return (
    <Wrapper>
      <GridWrap>
        <CardHead>
          <StyledTitle>Profile overview</StyledTitle>
          {account && (
            <Loader isLoading={isLoading}>
              <Txt>
                <RefreshCcw size={16} />
                &nbsp;&nbsp;
                <Txt secondary>
                  Last updated
                  <MouseoverTooltipContent content="Data is updated on the background periodically.">
                    <HelpCircle size={14} />
                  </MouseoverTooltipContent>
                  :&nbsp;
                </Txt>
                {!lastUpdated ? (
                  '-'
                ) : (
                  <MouseoverTooltipContent content={<TimeFormatted date={profileData?.lastUpdated} />}>
                    <strong>{lastUpdated}</strong>
                  </MouseoverTooltipContent>
                )}
              </Txt>
            </Loader>
          )}
        </CardHead>
        {chainId && chainId !== ChainId.MAINNET && (
          <StyledNotificationBanner changeOnProp={account} isVisible level="info" canClose={false}>
            Profile data is only available for mainnet. Please change the network to see it.
          </StyledNotificationBanner>
        )}
        <ChildWrapper>
          <Txt fs={16}>
            <strong>Your referral url</strong>
          </Txt>
          <Txt fs={14} center>
            {referralLink ? (
              <>
                <span style={{ wordBreak: 'break-all', display: 'inline-block' }}>
                  {referralLink.prefix}
                  <strong>{referralLink.address}</strong>
                  <span style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: 8 }}>
                    <Copy toCopy={referralLink.link} />
                  </span>
                </span>
              </>
            ) : (
              '-'
            )}
          </Txt>
        </ChildWrapper>
        <GridWrap horizontal>
          <ChildWrapper>
            <ItemTitle>
              Trades&nbsp;
              <MouseoverTooltipContent content="Statistics regarding your own trades.">
                <HelpCircle size={14} />
              </MouseoverTooltipContent>
            </ItemTitle>
            <FlexWrap className="item">
              <FlexCol>
                <span role="img" aria-label="farmer">
                  🧑‍🌾
                </span>
                <Loader isLoading={isLoading}>
                  <strong>{formatInt(profileData?.totalTrades)}</strong>
                </Loader>
                <Loader isLoading={isLoading}>
                  <span>Total trades</span>
                </Loader>
              </FlexCol>
              <FlexCol>
                <span role="img" aria-label="moneybag">
                  💰
                </span>
                <Loader isLoading={isLoading}>
                  <strong>{formatDecimal(profileData?.tradeVolumeUsd)}</strong>
                </Loader>
                <Loader isLoading={isLoading}>
                  <span>Total traded volume</span>
                </Loader>
              </FlexCol>
            </FlexWrap>
          </ChildWrapper>
          <ChildWrapper>
            <ItemTitle>
              Referrals&nbsp;
              <MouseoverTooltipContent content="Statistics regarding trades by people who used your referral link.">
                <HelpCircle size={14} />
              </MouseoverTooltipContent>
            </ItemTitle>
            <FlexWrap className="item">
              <FlexCol>
                <span role="img" aria-label="handshake">
                  🤝
                </span>
                <Loader isLoading={isLoading}>
                  <strong>{formatInt(profileData?.totalReferrals)}</strong>
                </Loader>
                <Loader isLoading={isLoading}>
                  <span>Total referrals</span>
                </Loader>
              </FlexCol>
              <FlexCol>
                <span role="img" aria-label="wingedmoney">
                  💸
                </span>
                <Loader isLoading={isLoading}>
                  <strong>{formatDecimal(profileData?.referralVolumeUsd)}</strong>
                </Loader>
                <Loader isLoading={isLoading}>
                  <span>Referrals volume</span>
                </Loader>
              </FlexCol>
            </FlexWrap>
          </ChildWrapper>
        </GridWrap>
        {!account && (
          <FlexWrap>
            <Web3Status openOrdersPanel={() => console.log('TODO')} />
          </FlexWrap>
        )}
      </GridWrap>
    </Wrapper>
  )
}

interface TimeProps {
  date: string | undefined
}

const TimeFormatted = ({ date }: TimeProps) => {
  if (!date) return null

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  const _date = new Date(date)
  const monthName = months[_date.getMonth()]
  const hours = _date.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })

  return <StyledTime>{`${_date.getDate()} ${monthName} ${_date.getFullYear()} - ${hours}`}</StyledTime>
}

const formatDecimal = (number?: number): string => {
  return number ? numberFormatter.format(number) : '-'
}

const formatInt = (number?: number): string => {
  return number ? number.toLocaleString() : '-'
}

const StyledNotificationBanner = styled(NotificationBanner)`
  border-radius: 14px;
`

const Loader = styled.div<{ isLoading: boolean }>`
  ${({ theme, isLoading }) =>
    isLoading &&
    css`
      position: relative;
      display: inline-block;

      overflow: hidden;
      &::after {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        transform: translateX(-100%);
        background-image: linear-gradient(
          90deg,
          rgba(255, 255, 255, 0) 0,
          ${theme.shimmer1} 20%,
          ${theme.shimmer2} 60%,
          rgba(255, 255, 255, 0)
        );
        animation: shimmer 2s infinite;
        content: '';
      }

      @keyframes shimmer {
        100% {
          transform: translateX(100%);
        }
      }
    `}
`
