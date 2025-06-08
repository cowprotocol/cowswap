import cow404IMG from '@cowprotocol/assets/cow-swap/cow-404.png'
import { ButtonPrimary, Media } from '@cowprotocol/ui'
import { ExternalLink as ExternalLinkTheme } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { Page, Title, Content, GdocsListStyle } from 'modules/application/pure/Page'

const ExternalLink = styled(ExternalLinkTheme)``

const Wrapper = styled(Page)`
  ${GdocsListStyle};
  min-height: auto;
  padding-bottom: 32px;

  ${Media.upToSmall()} {
    padding-bottom: 24px;
  }

  ${Title} {
    margin-bottom: 50px;
    font-size: 26px;

    ${Media.upToSmall()} {
      font-size: 18px;
      text-align: center;
    }
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
    color: ${({ theme }) => theme.info};
  }
`

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  ${ButtonPrimary} {
    width: 196px;
    padding: 9px;
    color: ${({ theme }) => theme.text1};

    &:hover {
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

  ${Media.upToSmall()} {
    img {
      max-width: 287px;
    }
    h2 {
      font-size: 16px;
      text-align: center;
    }
  }
`

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function AnySwapAffectedUsers() {
  return (
    <Wrapper>
      <Title>Your account is affected by the AnySwap Hack</Title>
      <Content>
        <Container>
          <img src={cow404IMG} alt="CoW Swap 404 not found" />
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
