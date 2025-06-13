import { PAGE_TITLES } from '@cowprotocol/common-const'

import { PageTitle } from 'modules/application/containers/PageTitle'
import { YieldWidget, YieldUpdaters } from 'modules/yield'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function YieldPage() {
  return (
    <>
      <PageTitle title={PAGE_TITLES.YIELD} />
      <YieldUpdaters />
      <YieldWidget />
    </>
  )
}
