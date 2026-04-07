import { ReactNode } from 'react'

import { PAGE_TITLES } from '@cowprotocol/common-const'

import { useLingui } from '@lingui/react/macro'

import { PageTitle } from 'modules/application'
import { YieldWidget, YieldUpdaters } from 'modules/yield'

export default function YieldPage(): ReactNode {
  const { i18n } = useLingui()

  return (
    <>
      <PageTitle title={i18n._(PAGE_TITLES.YIELD)} />
      <YieldUpdaters />
      <YieldWidget />
    </>
  )
}
