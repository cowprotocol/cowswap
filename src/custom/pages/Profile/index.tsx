import React from 'react'
import { Txt } from 'assets/styles/styled'
import {
  FlexCol,
  FlexWrap,
  Wrapper,
  GridWrap,
  CardHead,
  StyledTitle,
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

export default function Profile() {
  const referralLink = useReferralLink()
  const { account } = useActiveWeb3React()
  const profileData = useFetchProfile()
  const lastUpdated = useTimeAgo(profileData?.lastUpdated)

  return (
    <Wrapper>
      <GridWrap>
        <CardHead>
          <StyledTitle>Profile overview</StyledTitle>
          {account && (
            <Txt>
              <RefreshCcw size={16} />
              &nbsp;&nbsp;
              <Txt secondary>Last updated:&nbsp;</Txt>
              <strong>{lastUpdated || '-'}</strong>
            </Txt>
          )}
        </CardHead>
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
                  <span style={{ display: 'inline-block', verticalAlign: 'middle' }}>
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
              <HelpCircle size={14} />
            </ItemTitle>
            <FlexWrap className="item">
              <FlexCol>
                <span role="img" aria-label="farmer">
                  🧑‍🌾
                </span>
                <strong>{formatInt(profileData?.totalTrades)}</strong>
                <span>Total trades</span>
              </FlexCol>
              <FlexCol>
                <span role="img" aria-label="moneybag">
                  💰
                </span>
                <strong>{formatDecimal(profileData?.tradeVolumeUsd)}</strong>
                <span>Total traded volume</span>
              </FlexCol>
            </FlexWrap>
          </ChildWrapper>
          <ChildWrapper>
            <ItemTitle>
              Referrals&nbsp;
              <HelpCircle size={14} />
            </ItemTitle>
            <FlexWrap className="item">
              <FlexCol>
                <span role="img" aria-label="handshake">
                  🤝
                </span>
                <strong>{formatInt(profileData?.totalReferrals)}</strong>
                <span>Total referrals</span>
              </FlexCol>
              <FlexCol>
                <span role="img" aria-label="wingedmoney">
                  💸
                </span>
                <strong>{formatDecimal(profileData?.referralVolumeUsd)}</strong>
                <span>Referrals Volume</span>
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

const formatDecimal = (number?: number): string => {
  return number ? numberFormatter.format(number) : '-'
}

const formatInt = (number?: number): string => {
  return number ? number.toLocaleString() : '-'
}
