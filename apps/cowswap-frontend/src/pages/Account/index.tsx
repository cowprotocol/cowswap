import { lazy, Suspense } from 'react'

import { useLocation, Outlet } from 'react-router-dom'

import { Loading } from 'legacy/components/FlashingLoading'

import { PageTitle } from 'modules/application/containers/PageTitle'
import { Content, Title } from 'modules/application/pure/Page'

import { Routes as RoutesEnum } from 'common/constants/routes'

import { AccountMenu } from './Menu'
import { Container, CardsWrapper } from './styled'
import { Wrapper, AccountPageWrapper } from './Tokens/styled'

// Account pages
const Balances = lazy(() => import(/* webpackChunkName: "account" */ 'pages/Account/Balances'))
const Governance = lazy(() => import(/* webpackChunkName: "governance" */ 'pages/Account/Governance'))

function _getPropsFromRoute(route: string) {
  switch (route) {
    case RoutesEnum.ACCOUNT:
      return ['account-overview', 'Account overview']
    case RoutesEnum.ACCOUNT_GOVERNANCE:
      return ['account-governance', 'Governance']
    case RoutesEnum.ACCOUNT_TOKENS:
      return ['account-tokens', 'Tokens overview']
    default:
      return []
  }
}

// Note: As we build these single pages, we will remove this component in the future
export const AccountOverview = () => {
  return (
    <>
      <Container>
        <PageTitle title="Account Overview" />
        <CardsWrapper>
          <Balances />
          <Governance />
        </CardsWrapper>
      </Container>
    </>
  )
}

export default function Account() {
  const { pathname } = useLocation()
  const [id, name] = _getPropsFromRoute(pathname)
  return (
    <Wrapper>
      <AccountMenu />
      <Suspense fallback={Loading}>
        <AccountPageWrapper>
          <Content>
            <Title id={id}>{name}</Title>
            <Outlet />
          </Content>
        </AccountPageWrapper>
      </Suspense>
    </Wrapper>
  )
}
