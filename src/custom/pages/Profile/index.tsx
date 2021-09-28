import React from 'react'
import { Txt } from '@src/assets/styles/styled'
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
import { useActiveWeb3React } from '@src/hooks/web3'
import Copy from 'components/Copy/CopyMod'
import { AccountDetailsProps } from 'components/AccountDetails'
import { HelpCircle, RefreshCcw } from 'react-feather'
import Web3Status from '@src/components/Web3Status'

export default function Profile({ ENSName }: AccountDetailsProps) {
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
  const ethAddress = 'your-ethereum-address'
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
            {account ? (
              <>
                <span style={{ wordBreak: 'break-all' }}>
                  {window.location.href}
                  <strong>&lt;{ethAddress}&gt;</strong>&nbsp;
                </span>
                {(ENSName || account) && <Copy toCopy={ENSName ? ENSName : account ? account : ''} />}
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
            <Web3Status />
          </FlexWrap>
        )}
      </GridWrap>
    </Wrapper>
  )
}
