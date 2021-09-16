import React from 'react'
import { QuestionIcon, RepeatIcon } from '@src/components/icons'
import { Txt } from '@src/assets/styles/styled'
import {
  ChildWrapper,
  Wrapper,
  GridWrap,
  CardHead,
  StyledTitle,
  ItemTitle,
  Wrap,
  FlexCol,
  FlexCentered,
} from 'pages/Profile/styled'
import { useActiveWeb3React } from '@src/hooks/web3'
import { ButtonPrimary } from 'components/Button/ButtonMod'
import Copy from 'components/Copy/CopyMod'
import { AccountDetailsProps } from 'components/AccountDetails'

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
          <Txt>
            <RepeatIcon />
            &nbsp;&nbsp;
            <Txt fs={12} secondary>
              Last updated:&nbsp;
            </Txt>
            <Txt fs={12} fw={'bold'}>
              {label} ago
            </Txt>
          </Txt>
        </CardHead>
        <ChildWrapper>
          <Txt secondary fw={'bold'}>
            Your referral url
          </Txt>
          <Wrap>
            <Txt fs={14} txtAlign={'center'}>
              <span>
                https://cowswap.exchange/#/?referral=
                <strong>&lt;{ethAddress}&gt;</strong>&nbsp;
              </span>
            </Txt>
            {(ENSName || account) && <Copy bg toCopy={ENSName ? ENSName : account ? account : ''} />}
          </Wrap>
          {!account && <Txt fs={12}>(Connect your wallet to create a referral url)</Txt>}
        </ChildWrapper>
        <ChildWrapper>
          <ItemTitle>
            <span>Trades&nbsp;</span>
            <QuestionIcon />
          </ItemTitle>
          <FlexCentered>
            <FlexCol>
              <span role="img" aria-label="farmer">
                🧑‍🌾
              </span>
              <Txt fs={[24, 21]} fw={'bold'}>
                -
              </Txt>
              <Txt fs={14} secondary margin={'.5rem 0'} fw={'400'}>
                Total trades
              </Txt>
            </FlexCol>
            <FlexCol>
              <span role="img" aria-label="moneybag">
                💰
              </span>
              <Txt fs={[24, 21]} fw={'bold'}>
                -
              </Txt>
              <Txt fs={14} secondary margin={'.5rem 0'} fw={'400'}>
                Total traded volume
              </Txt>
            </FlexCol>
          </FlexCentered>
        </ChildWrapper>
        <ChildWrapper>
          <ItemTitle>
            <span>Referrals&nbsp;</span>
            <QuestionIcon />
          </ItemTitle>
          <FlexCentered>
            <FlexCol>
              <span role="img" aria-label="wingedmoney">
                💸
              </span>
              <Txt fs={[24, 21]} fw={'bold'}>
                -
              </Txt>
              <Txt fs={14} secondary margin={'.5rem 0'} fw={'400'}>
                Total trades
              </Txt>
            </FlexCol>
            <FlexCol>
              <span role="img" aria-label="handshake">
                🤝
              </span>
              <Txt fs={[24, 21]} fw={'bold'}>
                -
              </Txt>
              <Txt fs={14} secondary margin={'.5rem 0'}>
                Referrals Volume
              </Txt>
            </FlexCol>
          </FlexCentered>
        </ChildWrapper>
        {account && <ButtonPrimary> Connect to a wallet</ButtonPrimary>}
      </GridWrap>
    </Wrapper>
  )
}
