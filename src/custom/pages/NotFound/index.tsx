import { Link } from 'react-router-dom'
import styled from 'styled-components/macro'
import Page, { Title, Content, GdocsListStyle } from 'components/Page'
import { ButtonPrimary } from 'custom/components/Button'
import cow404IMG from 'assets/cow-swap/cow-404.png'

const Wrapper = styled(Page)`
  ${GdocsListStyle}
  min-height: auto;
  padding-bottom: 32px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding-bottom: 24px;
  `}
  ${Title} {
    margin-bottom: 50px;
    font-size: 26px;
    ${({ theme }) => theme.mediaWidth.upToSmall`
      font-size: 18px;
      text-align: center;
    `}
  }
  ${Content} {
    margin-bottom: 0;
  }
`

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  ${ButtonPrimary} {
    width: 196px;
    padding: 9px;
    color: ${({ theme }) => theme.primaryText1};
    &:hover {
      ${({ theme }) => theme.buttonPrimary.background}
    }
  }
  h2 {
    margin: 36px 0 32px;
  }
  img {
    max-width: 506px;
  }
  ${({ theme }) => theme.mediaWidth.upToSmall`
    img {
      max-width: 287px;
    }
    h2 {
      font-size: 16px;
      text-align: center;
    }
  `}
`

export default function NotFound() {
  return (
    <Wrapper>
      <Title>Page not found!</Title>
      <Content>
        <Container>
          <img src={cow404IMG} alt="CowSwap 404 not found" />
          <h2>The page you are looking for does not exist. </h2>
          <ButtonPrimary as={Link} to={'/'}>
            Back home
          </ButtonPrimary>
        </Container>
      </Content>
    </Wrapper>
  )
}
