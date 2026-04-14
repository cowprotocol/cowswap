import { ReactNode } from 'react'

import { PAGE_TITLES } from '@cowprotocol/common-const'

import { useLingui } from '@lingui/react/macro'

import { PageTitle } from 'modules/application'
import { PageWrapper, PrimaryWrapper } from 'modules/trade'
import { YieldWidget, YieldUpdaters } from 'modules/yield'

const TRADE_PAGE_MAX_WIDTH = '1800px'

export default function YieldPage(): ReactNode {
  const { i18n } = useLingui()

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
