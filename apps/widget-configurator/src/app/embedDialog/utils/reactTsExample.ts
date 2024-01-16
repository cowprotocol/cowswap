import type { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

import { formatParameters } from './formatParameters'

import { ColorPalette } from '../../configurator/types'
import { COMMENTS_BEFORE_PARAMS, IMPORT_STATEMENT } from '../const'

export function reactTsExample(params: CowSwapWidgetParams, defaultPalette: ColorPalette): string {
  return `
${IMPORT_STATEMENT} from '@cowprotocol/widget-react'

// ${COMMENTS_BEFORE_PARAMS}
const params: CowSwapWidgetParams = ${formatParameters(params, 0, true, defaultPalette)}

function App() {
  return (
    <CowSwapWidget params={params} />
  )
}
`
}
