import { PAGE_TITLES } from '@cowprotocol/common-const'

import { useLingui } from '@lingui/react/macro'

import { PageTitle } from 'modules/application/containers/PageTitle'
import { HooksStoreWidget } from 'modules/hooksStore'
import { SwapUpdaters } from 'modules/swap'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function HooksPage() {
  const { i18n } = useLingui()

  return (
    <>
      <PageTitle title={i18n._(PAGE_TITLES.HOOKS)} />
      <SwapUpdaters />
      <HooksStoreWidget />
    </>
  )
}
