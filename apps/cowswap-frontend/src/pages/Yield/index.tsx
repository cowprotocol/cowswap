import { PageTitle } from 'modules/application/containers/PageTitle'
import { YieldWidget, YieldUpdaters } from 'modules/yield'

export default function YieldPage() {
  return (
    <>
      <PageTitle title={'Yield'} />
      <YieldUpdaters />
      <YieldWidget />
    </>
  )
}
