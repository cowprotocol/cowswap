import { useAtomValue } from 'jotai'
import { lazy, ReactNode } from 'react'

import { PAGE_TITLES } from '@cowprotocol/common-const'
import { useWalletInfo } from '@cowprotocol/wallet'

import { t } from '@lingui/core/macro'
import { useLingui } from '@lingui/react/macro'
import { Outlet, useLocation } from 'react-router'

import {
  AffiliateFeedbackButton,
  TraderWalletStatus,
  affiliateTraderSavedCodeAtom,
  useAffiliateTraderWallet,
} from 'modules/affiliate'
import { Content, PageTitle, Title } from 'modules/application'

import { Routes as RoutesEnum } from 'common/constants/routes'
import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import { AccountMenu } from './Menu'
import { CardsWrapper, Container, TitleRow } from './styled'
import { AccountPageWrapper, Wrapper } from './Tokens/styled'

// Account pages
const Balances = lazy(() => import(/* webpackChunkName: "account" */ 'pages/Account/Balances'))
const Governance = lazy(() => import(/* webpackChunkName: "governance" */ 'pages/Account/Governance'))
const Delegate = lazy(() => import(/* webpackChunkName: "delegate" */ 'pages/Account/Delegate'))

interface AccountTitleProps {
  canShowAffiliateFeedbackButton: boolean
  id?: string
  name?: string
  pathname: string
}

interface TitleWithFeedbackProps {
  id?: string
  name?: string
}

function TitleWithFeedback({ id, name }: TitleWithFeedbackProps): ReactNode {
  return (
    <TitleRow>
      <Title id={id}>{name}</Title>
      <AffiliateFeedbackButton />
    </TitleRow>
  )
}

function MyRewardsTitleWithFeedback({ id, name }: TitleWithFeedbackProps): ReactNode {
  const { savedCode } = useAtomValue(affiliateTraderSavedCodeAtom)
  const walletStatus = useAffiliateTraderWallet()

  if (!savedCode || walletStatus === TraderWalletStatus.INELIGIBLE) {
    return <Title id={id}>{name}</Title>
  }

  return <TitleWithFeedback id={id} name={name} />
}

function AccountTitle({ canShowAffiliateFeedbackButton, id, name, pathname }: AccountTitleProps): ReactNode {
  if (!canShowAffiliateFeedbackButton) {
    return <Title id={id}>{name}</Title>
  }

  if (pathname === RoutesEnum.ACCOUNT_AFFILIATE_PARTNER) {
    return <TitleWithFeedback id={id} name={name} />
  }

  if (pathname === RoutesEnum.ACCOUNT_AFFILIATE_TRADER) {
    return <MyRewardsTitleWithFeedback id={id} name={name} />
  }

  return <Title id={id}>{name}</Title>
}

function getPropsFromRoute(route: string): string[] {
  switch (route) {
    case RoutesEnum.ACCOUNT:
      return ['account-overview', t`Account overview`]
    case RoutesEnum.ACCOUNT_GOVERNANCE:
      return ['account-governance', t`Governance`]
    case RoutesEnum.ACCOUNT_TOKENS:
      return ['account-tokens', t`Tokens overview`]
    case RoutesEnum.ACCOUNT_AFFILIATE_PARTNER:
      return ['account-affiliate', t`Rewards hub - Affiliate`]
    case RoutesEnum.ACCOUNT_AFFILIATE_TRADER:
      return ['account-my-rewards', t`Rewards hub - My Rewards`]
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
  const { account } = useWalletInfo()
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()
  const [id, name] = getPropsFromRoute(pathname)
  const canShowAffiliateFeedbackButton = Boolean(account) && !isProviderNetworkUnsupported

  return (
    <Wrapper>
      <AccountMenu />
      <AccountPageWrapper>
        <Content>
          <AccountTitle
            canShowAffiliateFeedbackButton={canShowAffiliateFeedbackButton}
            id={id}
            name={name}
            pathname={pathname}
          />
          <Outlet />
        </Content>
      </AccountPageWrapper>
    </Wrapper>
  )
}
