import type { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

import { sanitizeParameters } from './sanitizeParameters'

export function reactExample(params: CowSwapWidgetParams): string {
  const paramsSanitized = sanitizeParameters(params)

  return `
import { CowSwapWidget } from '@cowprotocol/widget-react'

const params: CowSwapWidgetParams = ${paramsSanitized}

function App() {
  return (
    <CowSwapWidget params={params} />
  )
}
`
}
