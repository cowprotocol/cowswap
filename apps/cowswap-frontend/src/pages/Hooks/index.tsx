import { HooksStoreWidget } from 'modules/hooksStore'
import { SwapUpdaters } from 'modules/swap'

export function HooksPage() {
  return (
    <>
      <SwapUpdaters />
      <HooksStoreWidget />
    </>
  )
}
