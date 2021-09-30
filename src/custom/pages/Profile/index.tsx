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

export default function Profile() {
  const referralLink = useReferralLink()
  const today = new Date()
  //mockTime - mocked time of update
  const mockTime = new Date()
  mockTime.setDate(today.getDate() - 1)

  let label = ''
  if (mockTime.getHours() > 0) {
    label = ''
    label = `${mockTime.getHours()} ${mockTime.getHours() > 1 ? 'hours' : 'hour'}`
  } else if (mockTime.getMinutes() > 0) {
    label += `${mockTime.getMinutes()} ${mockTime.getMinutes() > 1 ? 'mins' : 'min'}`
  } else if (mockTime.getSeconds() > 0) {
    label += `${mockTime.getSeconds()} ${mockTime.getSeconds() > 1 ? 'secs' : 'sec'}`
  } else {
    label = 'Just now'
  }

  const { account } = useActiveWeb3React()

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
              <strong>{label} ago</strong>
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
                  {referralLink}
                  <span style={{ display: 'inline-block', verticalAlign: 'middle' }}>
                    <Copy toCopy={referralLink} />
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
                <strong>-</strong>
                <span>Total trades</span>
              </FlexCol>
              <FlexCol>
                <span role="img" aria-label="moneybag">
                  💰
                </span>
                <strong>-</strong>
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
                <span role="img" aria-label="wingedmoney">
                  💸
                </span>
                <strong>-</strong>
                <span>Total trades</span>
              </FlexCol>
              <FlexCol>
                <span role="img" aria-label="handshake">
                  🤝
                </span>
                <strong>-</strong>
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
