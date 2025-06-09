import { PAGE_TITLES } from '@cowprotocol/common-const'

import { PageTitle } from 'modules/application/containers/PageTitle'
import { HooksStoreWidget } from 'modules/hooksStore'
import { SwapUpdaters } from 'modules/swap'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function HooksPage() {
  return (
    <>
      <PageTitle title={PAGE_TITLES.HOOKS} />
      <SwapUpdaters />
      <HooksStoreWidget />
    </>
  )
}
