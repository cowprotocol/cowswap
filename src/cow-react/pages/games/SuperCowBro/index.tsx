import { Page, Content } from '@cow/modules/application/pure/Page'
import styled from 'styled-components/macro'
import { useEffect } from 'react'
import { gameAnalytics } from 'components/analytics'
import { PageTitle } from '@cow/modules/application/containers/PageTitle'

const Wrapper = styled(Page)`
  max-width: 950px;
`

const GAME_NAME = 'Super CoW Bro'

export default function SuperCowBro() {
  useEffect(() => {
    gameAnalytics(GAME_NAME)
  }, [])

  return (
    <Wrapper>
      <PageTitle title={GAME_NAME + ' 🤟'} />
      <p>
        Try to <strong>collect $COINS</strong> 🤑 and <strong>scape</strong> from the deadly{' '}
        <strong>Sandwitch attacks</strong> 🔪🥪
      </p>
      <ul>
        <ol>
          <li>Write the name of your CoW</li>
          <li>Select your level of difficulty</li>
          <li>Press PLAY!</li>
        </ol>
      </ul>

      <Content>
        <iframe
          src="/games/SuperCowBro/index.html"
          title={GAME_NAME}
          width="100%"
          height="650px"
          frameBorder="0"
        ></iframe>
      </Content>
    </Wrapper>
  )
}
