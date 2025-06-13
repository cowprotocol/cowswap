import { Media } from '@cowprotocol/ui'

import { getNetworkFromId } from '@gnosis.pm/dex-js'
import { Helmet } from 'react-helmet'
import styled from 'styled-components/macro'

import { ContentCard as Content, StyledLink, Title, Wrapper as WrapperTemplate } from './styled'

import { useNetworkId } from '../../state/network'
import { APP_TITLE } from '../const'

const Wrapper = styled(WrapperTemplate)`
  ${Media.upToMedium()} {
    flex-flow: column wrap;
  }
`

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const NotFoundRequestPage = () => {
  const networkId = useNetworkId() ?? 1
  const network = networkId !== 1 ? getNetworkFromId(networkId).toLowerCase() : ''

  return (
    <Wrapper>
      <Helmet>
        <title>Page not found - {APP_TITLE}</title>
      </Helmet>
      <Title>Page not found</Title>
      <Content>
        <p>We&apos;re sorry, the page you requested could not be found.</p>
        <StyledLink to={`/${network}`}>Back Home</StyledLink>
      </Content>
    </Wrapper>
  )
}

export default NotFoundRequestPage
