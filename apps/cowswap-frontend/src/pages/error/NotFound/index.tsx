import { useEffect, useMemo } from 'react'

import { ButtonPrimary, Media, UI } from '@cowprotocol/ui'

import { Link } from 'react-router'
import styled from 'styled-components/macro'

import { useDarkModeManager } from 'legacy/state/user/hooks'

import { usePageBackground } from 'modules/application/contexts/PageBackgroundContext'
import { Content, GdocsListStyle, Page, Title } from 'modules/application/pure/Page'

import { CowSaucerScene } from './CowSaucerScene'

const Wrapper = styled(Page)`
  ${GdocsListStyle};
  min-height: auto;
  padding-bottom: 32px;
  background: transparent;
  box-shadow: none;
  border: none;
  padding-top: 0;

  ${Media.upToSmall()} {
    padding-bottom: 24px;
  }

  ${Title} {
    font-size: 52px;
    font-weight: 600;
    text-align: center;

    ${Media.upToSmall()} {
      font-size: 28px;
      text-align: center;
    }
  }

  ${Content} {
    margin-bottom: 0;
  }
`

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;

  h2 {
    text-align: center;
    font-weight: 400;
    color: var(${UI.COLOR_TEXT_OPACITY_70});
  }
`

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function NotFound() {
  const { setVariant, setScene } = usePageBackground()
  const [darkMode] = useDarkModeManager()

  useEffect(() => {
    setVariant('nocows')

    return () => setVariant('default')
  }, [setVariant])

  const scene = useMemo(() => <CowSaucerScene darkMode={darkMode} />, [darkMode])

  useEffect(() => {
    setScene(scene)

    return () => setScene(null)
  }, [scene, setScene])

  return (
    <Wrapper>
      <Title>Page not found!</Title>
      <Content>
        <Container>
          <h2>The page you are looking for does not exist. </h2>
          <ButtonPrimary as={Link} to={'/'}>
            Back home
          </ButtonPrimary>
        </Container>
      </Content>
    </Wrapper>
  )
}
