import type { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

import { formatParameters } from './formatParameters'

import { COMMENTS_BEFORE_PARAMS } from '../const'

export function reactExample(params: CowSwapWidgetParams): string {
  return `
import { CowSwapWidget, CowSwapWidgetParams } from '@cowprotocol/widget-react'

// ${COMMENTS_BEFORE_PARAMS}
const params: CowSwapWidgetParams = ${formatParameters(params)}

function App() {
  return (
    <CowSwapWidget params={params} />
  )
}
`
}
