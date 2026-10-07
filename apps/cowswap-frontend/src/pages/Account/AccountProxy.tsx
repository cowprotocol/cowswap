import { ReactNode } from 'react'

import { PAGE_TITLES } from '@cowprotocol/common-const'

import { useLingui } from '@lingui/react/macro'

import { AccountProxyWidgetPage } from 'modules/accountProxy'
import { PageTitle } from 'modules/application'

export default function AccountProxy(): ReactNode {
  const { i18n } = useLingui()

  return (
    <>
      <PageTitle title={i18n._(PAGE_TITLES.ACCOUNT_PROXY)} />
      <AccountProxyWidgetPage />
    </>
  )
}
