import React from 'react'
import Page, { Title, Content, GdocsListStyle } from 'components/Page'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'
import CowsImg from 'assets/images/cows.png'
import CopyHelper from 'components/Copy'

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  margin-top: 1rem;
`

const FlexContainer = styled.div`
  display: flex;
  align-items: flex-start;
`

const SecondaryButton = styled.div`
  width: 350px;
  height: 65px;
  border: 1px solid #3d3d3d;
  box-sizing: border-box;
  border-radius: 9px;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 0.5rem;
  cursor: pointer;
`

const PrimaryButton = styled(SecondaryButton)`
  background: rgba(242, 103, 57, 0.78);
  color: white;
`

const TextGroup = styled.div`
  margin-left: 1.5rem;
`

const Wrapper = styled(Page)`
  ${GdocsListStyle}

  max-width: 1000px;
  padding-top: 1rem;

  span[role='img'] {
    font-size: 1.8em;
  }
`

export default function About() {
  return (
    <Wrapper>
      <Content>
        <FlexContainer>
          <div>
            <Title>Cowswap Affiliate Program</Title>
            <TextGroup>
              <b>
                <span role="img" aria-label="Milk">
                  🥛
                </span>
                Milk taste better, when shared with friends!
              </b>
              <p>
                You love CowSwap, we know that, but what if we told you you can let others love it too and get some
                rewards for doing so.
              </p>
              <br />
              <p>Join CowSwap affiliate program, and start now accring rewards every time they trade.</p>
              <p>
                The best part, is your referrals will also get rewards for trading if they join CowSwap using your link.
              </p>
              <b>Create your referral link now:</b>
            </TextGroup>
          </div>
          <img src={CowsImg} alt="Cows" />
          <CopyHelper toCopy={'SARASA'}>Copy to clipboard</CopyHelper>
        </FlexContainer>

        <ButtonGroup>
          <PrimaryButton>
            <Trans>Create affiliate link</Trans>
          </PrimaryButton>
          <SecondaryButton>
            <Trans>Learn about the Affiliate Program</Trans>
          </SecondaryButton>
        </ButtonGroup>
      </Content>
    </Wrapper>
  )
}
