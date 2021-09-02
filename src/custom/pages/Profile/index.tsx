import React from 'react'
import { CopyIcon, QuestionIcon, RollBackIcon } from '@src/components/icons'
import { Txt, Wrap, Row, Column } from '@src/assets/styles/styled'
import { StyledSmallBtn, StyledWrap, Wrapper } from 'pages/Profile/styled'

export default function Profile() {
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
  const copyToClipboard = () => {
    alert('Copied!')
  }
  return (
    <Wrapper>
      <Wrap flexDir={'column'}>
        <Wrap width={'100%'} alignItems={'center'} grow={'1'} flexDir={['column', 'row']}>
          <Wrap justifyCont={['center', 'flex-start']} grow={'1'}>
            <Txt fw={'bold'} txtAlign={['center', 'left']} fs={[18, 26]}>
              Profile overview
            </Txt>
          </Wrap>
          <Wrap justifyCont={['center', 'flex-end']} grow={'1'}>
            <RollBackIcon />
            <Txt>
              <Txt secondary>Last updated:&nbsp;</Txt>
              <Txt fw={'bold'}>{label} ago</Txt>
            </Txt>
          </Wrap>
        </Wrap>
        <StyledWrap>
          <Txt secondary fw={'bold'}>
            Your referral url
          </Txt>
          <Wrap alignItems={'center'} justifyCont={'center'}>
            <Txt onClick={() => copyToClipboard()} fs={14} txtAlign={'center'}>
              <Wrap grow={'1'} justifyCont={'center'}>
                https://cowswap.exchange/#/?referral=
                <strong>&lt;{ethAddress}&gt;</strong>
              </Wrap>
            </Txt>
            <StyledSmallBtn onClick={() => copyToClipboard()}>
              <CopyIcon />
            </StyledSmallBtn>
          </Wrap>
        </StyledWrap>
        <Wrap width={'100%'}>
          <Row>
            <Column md={50}>
              <StyledWrap>
                <Wrap alignItems={'center'} margin={'0 0 1.875rem'}>
                  <Txt fs={18} secondary fw={'bold'}>
                    Trades&nbsp;
                  </Txt>
                  <QuestionIcon />
                </Wrap>
                <Wrap width={'100%'}>
                  <Wrap flexDir={'column'} alignItems={'center'} grow={'1'}>
                    {/*temp pics solution  */}
                    <img
                      style={{ margin: ' .625rem auto' }}
                      src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/72/apple/118/male-farmer_1f468-200d-1f33e.png"
                      alt={'man-farmer'}
                    />
                    <Txt fs={[26, 21]} fw={'bold'}>
                      -
                    </Txt>
                    <Txt fs={14} secondary margin={'.5rem 0'} fw={'400'}>
                      Total trades
                    </Txt>
                  </Wrap>
                  <Wrap flexDir={'column'} alignItems={'center'} grow={'1'}>
                    {/*temp pics solution  */}
                    <img
                      style={{ margin: ' .625rem auto' }}
                      src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/72/apple/118/money-bag_1f4b0.png"
                      alt={'money-bag'}
                    />
                    <Txt fs={[26, 21]} fw={'bold'}>
                      -
                    </Txt>
                    <Txt fs={14} secondary margin={'.5rem 0'} fw={'400'}>
                      Total traded volume
                    </Txt>
                  </Wrap>
                </Wrap>
              </StyledWrap>
            </Column>
            <Column md={50}>
              <StyledWrap>
                <Wrap alignItems={'center'} margin={'0 0 1.875rem'}>
                  <Txt fs={18} secondary fw={'bold'}>
                    Referrals&nbsp;
                  </Txt>
                  <QuestionIcon />
                </Wrap>
                <Wrap width={'100%'}>
                  <Wrap flexDir={'column'} alignItems={'center'} grow={'1'}>
                    {/*temp pics solution  */}
                    <img
                      style={{ margin: ' .625rem auto' }}
                      src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/72/apple/118/handshake_1f91d.png"
                      alt={'handshake_1f91d'}
                    />
                    <Txt fs={[26, 21]} fw={'bold'}>
                      -
                    </Txt>
                    <Txt fs={14} secondary margin={'.5rem 0'} fw={'400'}>
                      Total trades
                    </Txt>
                  </Wrap>
                  <Wrap flexDir={'column'} alignItems={'center'} grow={'1'}>
                    {/*temp pics solution  */}
                    <img
                      style={{ margin: ' .625rem auto' }}
                      src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/72/apple/118/money-with-wings_1f4b8.png"
                      alt={'money-with-wings'}
                    />
                    <Txt fs={[26, 21]} fw={'bold'}>
                      -
                    </Txt>
                    <Txt fs={14} secondary margin={'.5rem 0'}>
                      Referrals Volume
                    </Txt>
                  </Wrap>
                </Wrap>
              </StyledWrap>
            </Column>
          </Row>
        </Wrap>
      </Wrap>
    </Wrapper>
  )
}
