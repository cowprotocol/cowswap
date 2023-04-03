import { lazy, Suspense } from 'react'
import { useLocation, Outlet } from 'react-router-dom'
import { AccountMenu } from './Menu'
import { Wrapper, AccountPageWrapper } from './Tokens/styled'
import { Content, Title } from '@cow/modules/application/pure/Page'
import { Routes as RoutesEnum } from '@cow/constants/routes'
import { Loading } from 'components/FlashingLoading'
import { Container, CardsWrapper } from './styled'
import AffiliateStatusCheck from 'components/AffiliateStatusCheck'
import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { PageName } from 'components/AmplitudeAnalytics/constants'
import { Trace } from 'components/AmplitudeAnalytics/Trace'
import { PageTitle } from '@cow/modules/application/containers/PageTitle'
import { useWalletInfo } from '@cow/modules/wallet'

// Account pages
const Balances = lazy(() => import(/* webpackChunkName: "account" */ '@cow/pages/Account/Balances'))
const Governance = lazy(() => import(/* webpackChunkName: "governance" */ '@cow/pages/Account/Governance'))
const Affiliate = lazy(() => import(/* webpackChunkName: "affiliate" */ '@cow/pages/Account/Affiliate'))

function _getPropsFromRoute(route: string) {
  switch (route) {
    case RoutesEnum.ACCOUNT:
      return ['account-overview', 'Account overview']
    case RoutesEnum.ACCOUNT_AFFILIATE:
      return ['account-affiliate', 'Affiliate']
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
  const { chainId } = useWalletInfo()

  return (
    <Trace page={PageName.ACCOUNT_OVERVIEW_PAGE} shouldLogImpression>
      <Container>
        <PageTitle title="Account Overview" />
        {chainId === ChainId.MAINNET && <AffiliateStatusCheck />}

        <CardsWrapper>
          <Balances />
          <Governance />
        </CardsWrapper>
        <Affiliate />
      </Container>
    </Trace>
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
