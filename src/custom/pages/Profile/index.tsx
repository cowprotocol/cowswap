import React from 'react'
import Page, { Title, Content, GdocsListStyle } from 'components/Page'
import styled from 'styled-components'
import { Trans } from '@lingui/macro'
import CowsImg from 'custom/assets/cow-swap/cows-side-by-side.png'
import { ButtonPrimary, ButtonSecondary } from 'custom/components/Button'

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  margin-top: 1rem;
`

const ButtonContainer = styled.div`
  margin: 0 0.5rem;
`

const FlexContainer = styled.div`
  display: flex;
  align-items: flex-start;

  @media screen and (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
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

export default function Profile() {
  return (
    <Wrapper>
      <Content>
        <FlexContainer>
          <div>
            <Title>Profile</Title>
            <TextGroup>
              <strong>
                <span role="img" aria-label="Milk">
                  🥛
                </span>
                Milk taste better, when shared with friends!
              </strong>
              <p>
                You love CowSwap, we know that, but what if we told you you can let others love it too and get some
                rewards for doing so.
              </p>
              <br />
              <p>Join CowSwap affiliate program, and start now accruing rewards every time they trade.</p>
              <p>
                The best part, is your referrals will also get rewards for trading if they join CowSwap using your link.
              </p>
            </TextGroup>
          </div>
          <img src={CowsImg} alt="Cows" style={{ marginBottom: '1rem' }} />
        </FlexContainer>

        <b style={{ marginLeft: '1.5rem' }}>Create your referral link now:</b>
        <ButtonGroup>
          <ButtonContainer>
            <ButtonPrimary>
              <Trans>Create affiliate link</Trans>
            </ButtonPrimary>
          </ButtonContainer>
          <ButtonContainer>
            <ButtonSecondary>
              <Trans>Learn about the Affiliate Program</Trans>
            </ButtonSecondary>
          </ButtonContainer>
        </ButtonGroup>
      </Content>
    </Wrapper>
  )
}
