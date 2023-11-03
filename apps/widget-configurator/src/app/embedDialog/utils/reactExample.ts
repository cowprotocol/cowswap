import type { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

export function reactExample(params: CowSwapWidgetParams): string {
  const paramsSanitized = {
    ...params,
    provider: `<eip-1193 provider>`,
  }

  return `
import { CowSwapWidget } from '@cowprotocol/widget-react'

const params: CowSwapWidgetParams = ${JSON.stringify(paramsSanitized, null, 4)}

function App() {
  return (
    <CowSwapWidget params={params} />
  )
}
`
}
