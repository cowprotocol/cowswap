import type { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

import { REACT_IMPORT_STATEMENT, PROVIDER_PARAM_COMMENT } from './common/codeExample.constants'
import { formatParameters } from './common/formatParameters.utils'

import { ColorPalette } from '../../../configurator.types'

export function reactTsExample(params: CowSwapWidgetParams, defaultPalette: ColorPalette): string {
  return `${REACT_IMPORT_STATEMENT} from '@cowprotocol/widget-react'

const params: CowSwapWidgetParams = ${formatParameters(params, 0, true, defaultPalette)}

${PROVIDER_PARAM_COMMENT}
const provider = window.ethereum

function App() {
  return (
    <CowSwapWidget params={params} provider={provider} />
  )
}`
}
