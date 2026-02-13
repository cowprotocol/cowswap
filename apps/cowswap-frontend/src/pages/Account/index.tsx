import { lazy, ReactNode } from 'react'

import { PAGE_TITLES } from '@cowprotocol/common-const'

import { t } from '@lingui/core/macro'
import { useLingui } from '@lingui/react/macro'
import { Outlet, useLocation, matchPath } from 'react-router'

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

function _getPropsFromRoute(route: string): string[] {
  if (
    matchPath(RoutesEnum.ACCOUNT_PROXIES, route) ||
    matchPath(RoutesEnum.ACCOUNT_PROXY, route) ||
    matchPath(RoutesEnum.ACCOUNT_PROXY_RECOVER, route) ||
    matchPath(RoutesEnum.ACCOUNT_PROXY_HELP, route)
  ) {
    return ['account-proxy', t`Account Proxy`]
  }

  switch (route) {
    case RoutesEnum.ACCOUNT:
      return ['account-overview', t`Account overview`]
    case RoutesEnum.ACCOUNT_GOVERNANCE:
      return ['account-governance', t`Governance`]
    case RoutesEnum.ACCOUNT_TOKENS:
      return ['account-tokens', t`Tokens overview`]
    default:
      return []
  }
}

// Note: As we build these single pages, we will remove this component in the future
export const AccountOverview = (): ReactNode => {
  const { i18n } = useLingui()

  return (
    <>
      <Container>
        <PageTitle title={i18n._(PAGE_TITLES.ACCOUNT_OVERVIEW)} />
        <CardsWrapper>
          <Balances />
          <Governance />
          <Delegate />
        </CardsWrapper>
      </Container>
    </>
  )
}

export default function Account(): ReactNode {
  const { pathname } = useLocation()
  const [id, name] = _getPropsFromRoute(pathname)
  return (
    <Wrapper>
      <AccountMenu />
      <AccountPageWrapper>
        <Content>
          <Title id={id}>{name}</Title>
          <Outlet />
        </Content>
      </AccountPageWrapper>
    </Wrapper>
  )
}
