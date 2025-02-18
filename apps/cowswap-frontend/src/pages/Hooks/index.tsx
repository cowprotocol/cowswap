import { HooksStoreWidget } from 'modules/hooksStore'
import { SwapUpdaters } from 'modules/swap2'

export function HooksPage() {
  return (
    <>
      <SwapUpdaters />
      <HooksStoreWidget />
    </>
  )
}
