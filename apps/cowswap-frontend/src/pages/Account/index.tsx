import { lazy, ReactNode } from 'react'

import { PAGE_TITLES } from '@cowprotocol/common-const'
import { useFeatureFlags } from '@cowprotocol/common-hooks'

import { t } from '@lingui/core/macro'
import { useLingui } from '@lingui/react/macro'
import { Outlet, useLocation } from 'react-router'

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

function getPropsFromRoute(route: string, isAffiliateProgramEnabled: boolean): string[] {
  switch (route) {
    case RoutesEnum.ACCOUNT:
      return ['account-overview', t`Account overview`]
    case RoutesEnum.ACCOUNT_GOVERNANCE:
      return ['account-governance', t`Governance`]
    case RoutesEnum.ACCOUNT_TOKENS:
      return ['account-tokens', t`Tokens overview`]
    case RoutesEnum.ACCOUNT_AFFILIATE:
      return isAffiliateProgramEnabled ? ['account-affiliate', t`Rewards hub - Affiliate`] : []
    case RoutesEnum.ACCOUNT_MY_REWARDS:
      return isAffiliateProgramEnabled ? ['account-my-rewards', t`Rewards hub - My rewards`] : []
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
  const { isAffiliateProgramEnabled = false } = useFeatureFlags()
  const [id, name] = getPropsFromRoute(pathname, isAffiliateProgramEnabled)
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
