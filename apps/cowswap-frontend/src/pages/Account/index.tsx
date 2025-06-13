import { lazy, Suspense } from 'react'

import { PAGE_TITLES } from '@cowprotocol/common-const'

import { Outlet, useLocation } from 'react-router'

import { Loading } from 'legacy/components/FlashingLoading'

import { PageTitle } from 'modules/application/containers/PageTitle'
import { Content, Title } from 'modules/application/pure/Page'

import { Routes as RoutesEnum } from 'common/constants/routes'

import { AccountMenu } from './Menu'
import { CardsWrapper, Container } from './styled'
import { AccountPageWrapper, Wrapper } from './Tokens/styled'

// Account pages
const Balances = lazy(() => import(/* webpackChunkName: "account" */ 'pages/Account/Balances'))
const Governance = lazy(() => import(/* webpackChunkName: "governance" */ 'pages/Account/Governance'))
const Delegate = lazy(() => import(/* webpackChunkName: "delegate" */ 'pages/Account/Delegate'))

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const AccountOverview = () => {
  return (
    <>
      <Container>
        <PageTitle title={PAGE_TITLES.ACCOUNT_OVERVIEW} />
        <CardsWrapper>
          <Balances />
          <Governance />
          <Delegate />
        </CardsWrapper>
      </Container>
    </>
  )
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function Account() {
  const { pathname } = useLocation()
  const [id, name] = _getPropsFromRoute(pathname)
  return (
    <Wrapper>
      <AccountMenu />
      <Suspense fallback={<Loading />}>
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
