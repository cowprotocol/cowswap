import type { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

import { formatParameters } from './formatParameters'

import { ColorPalette } from '../../configurator/types'
import { COMMENTS_BEFORE_PARAMS, REACT_IMPORT_STATEMENT, PROVIDER_PARAM_COMMENT } from '../const'

export function reactTsExample(params: CowSwapWidgetParams, defaultPalette: ColorPalette): string {
  return `
${REACT_IMPORT_STATEMENT} from '@cowprotocol/widget-react'

// ${COMMENTS_BEFORE_PARAMS}
const params: CowSwapWidgetParams = ${formatParameters(params, 0, true, defaultPalette)}

// ${PROVIDER_PARAM_COMMENT}
const provider = window.ethereum

function App() {
  return (
    <CowSwapWidget params={params} provider={provider} />
  )
}
`
}
