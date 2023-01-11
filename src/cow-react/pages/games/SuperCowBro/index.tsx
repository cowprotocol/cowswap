import { Page, Content } from '@cow/modules/application/pure/Page'
import styled from 'styled-components/macro'
import { useEffect } from 'react'
import { gameAnalytics } from 'components/analytics'
import { PageTitle } from '@cow/modules/application/containers/PageTitle'

const Wrapper = styled(Page)`
  max-width: 950px;
`

const IframeStyled = styled.iframe`
  margin: 0 auto;
  display: block;
  border: 1px solid #000;
  box-sizing: content-box;
`

const Title = styled.p`
  margin: 40px 0 20px 0;
  text-align: center;
  font-size: 22px;
`

const GAME_NAME = 'Super CoW Bro'

export default function SuperCowBro() {
  useEffect(() => {
    gameAnalytics(GAME_NAME)
  }, [])

  return (
    <Wrapper>
      <PageTitle title={GAME_NAME + ' 🤟'} />
      <Title>
        Try to <strong>collect $COINS</strong> 🤑 and <strong>scape</strong> from the deadly{' '}
        <strong>Sandwitch attacks</strong> 🔪🥪
      </Title>

      <Content>
        <IframeStyled
          src="https://cowrunner.herokuapp.com"
          title={GAME_NAME}
          width="840px"
          height="480px"
          frameBorder="0"
        ></IframeStyled>
      </Content>
    </Wrapper>
  )
}
