import { lazy, Suspense } from 'react'
import { Switch, Route, useLocation } from 'react-router-dom'
import { AccountMenu } from './Menu'
import { Wrapper, AccountPageWrapper } from './Tokens/styled'
import { Content } from 'components/Page'
import { Routes } from 'constants/routes'
import { Loading } from 'components/FlashingLoading'
import { Container, CardsWrapper } from './styled'
import { useWeb3React } from '@web3-react/core'
import AffiliateStatusCheck from 'components/AffiliateStatusCheck'
import { SupportedChainId as ChainId } from 'constants/chains'
import { Title } from 'components/Page'
import PageTitle from 'components/PageTitle'

// Account pages
const Balances = lazy(() => import(/* webpackChunkName: "account" */ 'pages/Account/Balances'))
const TokensOverview = lazy(() => import(/* webpackChunkName: "tokens_overview" */ 'pages/Account/Tokens'))
const Governance = lazy(() => import(/* webpackChunkName: "governance" */ 'pages/Account/Governance'))
const Affiliate = lazy(() => import(/* webpackChunkName: "affiliate" */ 'pages/Account/Affiliate'))
// Not found catch
const NotFound = lazy(() => import(/* webpackChunkName: "affiliate" */ 'pages/error/NotFound'))

function _getPropsFromRoute(route: string) {
  switch (route) {
    case Routes.ACCOUNT:
      return ['account-overview', 'Overview']
    case Routes.ACCOUNT_AFFILIATE:
      return ['account-affiliate', 'Affiliate']
    case Routes.ACCOUNT_GOVERNANCE:
      return ['account-governance', 'Governance']
    case Routes.ACCOUNT_TOKENS:
      return ['account-tokens', 'Tokens']
    default:
      return []
  }
}

// Note: As we build these single pages, we will remove this component in the future
const Overview = () => {
  const { chainId } = useWeb3React()

  return (
    <Container>
      <PageTitle title="Account Overview" />

      {chainId === ChainId.MAINNET && <AffiliateStatusCheck />}

      <CardsWrapper>
        <Balances />
        <Governance />
      </CardsWrapper>
      <Affiliate />
    </Container>
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
            <Switch>
              <Route exact path={Routes.ACCOUNT} component={Overview} />
              {/* <Route exact strict path={Routes.ACCOUNT_GOVERNANCE} component={Governance} /> */}
              <Route exact strict path={Routes.ACCOUNT_TOKENS} component={TokensOverview} />
              {/* <Route exact strict path={Routes.ACCOUNT_AFFILIATE} component={Affiliate} /> */}
              <Route component={NotFound} />
            </Switch>
          </Content>
        </AccountPageWrapper>
      </Suspense>
    </Wrapper>
  )
}
