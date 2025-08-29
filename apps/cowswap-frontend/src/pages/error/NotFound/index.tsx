import cow404IMG from '@cowprotocol/assets/cow-swap/cow-404.png'
import { ButtonPrimary, Media } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { Link } from 'react-router'
import styled from 'styled-components/macro'

import { Content, GdocsListStyle, Page, Title } from 'modules/application/pure/Page'

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
  }
`

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  ${ButtonPrimary} {
    width: 196px;
    padding: 9px;

    &:hover {
    }
  }

  h2 {
    margin: 36px 0 32px;
  }

  img {
    max-width: 506px;
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
export default function NotFound() {
  return (
    <Wrapper>
      <Title>
        <Trans>Page not found!</Trans>
      </Title>
      <Content>
        <Container>
          <img src={cow404IMG} alt={t`CowSwap 404 not found`} />
          <h2>
            <Trans>The page you are looking for does not exist.</Trans>{' '}
          </h2>
          <ButtonPrimary as={Link} to={'/'}>
            <Trans>Back home</Trans>
          </ButtonPrimary>
        </Container>
      </Content>
    </Wrapper>
  )
}
