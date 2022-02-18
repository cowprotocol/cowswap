import styled from 'styled-components/macro'
import Page, { Title, Content, GdocsListStyle } from 'components/Page'
import { ButtonPrimary } from 'custom/components/Button'
import cow404IMG from 'assets/cow-swap/cow-404.png'
import { ExternalLink as ExternalLinkTheme } from 'theme'

const ExternalLink = styled(ExternalLinkTheme)``

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

    pre {
      display: inline;
    }
  }

  ${ExternalLink} {
    text-decoration: underline;
    font-weight: 800;
    color: ${({ theme }) => theme.primary1};
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

  p {
    text-align: left;
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

export default function AnySwapAffectedUsers() {
  return (
    <Wrapper>
      <Title>Your account is affected by the AnySwap Hack</Title>
      <Content>
        <Container>
          <img src={cow404IMG} alt="CowSwap 404 not found" />
          <h2>Read how to prevent losing funds</h2>
        </Container>
        <p>
          You have given an allowance to <pre>AnyswapV4Router</pre> which is affected by a critical vulnerability.
        </p>
        <p>In order to protect your funds, you will need to remove the approval on this contract.</p>
        <p>
          Please read more in this{' '}
          <ExternalLink href="https://cointelegraph.com/news/multichain-asks-users-to-revoke-approvals-amid-critical-vulnerability">
            link
          </ExternalLink>
          .
        </p>
      </Content>
    </Wrapper>
  )
}
