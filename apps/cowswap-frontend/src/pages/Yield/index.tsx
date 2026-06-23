import { ReactNode } from 'react'

import { PAGE_TITLES } from '@cowprotocol/common-const'

import { useLingui } from '@lingui/react/macro'
import { useParams } from 'react-router'

import { PageTitle } from 'modules/application'
import { PageWrapper, PrimaryWrapper, TradeRouteRedirect } from 'modules/trade'
import { YieldWidget, YieldUpdaters } from 'modules/yield'

import { Routes } from 'common/constants/routes'

const TRADE_PAGE_MAX_WIDTH = '1800px'

export default function YieldPage(): ReactNode {
  const params = useParams()
  const { i18n } = useLingui()

  if (!params.chainId) {
    return <TradeRouteRedirect route={Routes.YIELD} />
  }

  return (
    <>
      <PageTitle title={i18n._(PAGE_TITLES.YIELD)} />
      <YieldUpdaters />
      <PageWrapper isUnlocked maxWidth={TRADE_PAGE_MAX_WIDTH} hideOrdersTable>
        <PrimaryWrapper>
          <YieldWidget />
        </PrimaryWrapper>
      </PageWrapper>
    </>
  )
}
