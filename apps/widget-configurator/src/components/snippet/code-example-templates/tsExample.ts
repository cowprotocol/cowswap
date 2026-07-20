import type { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

import {
  COMMENTS_BEFORE_PARAMS,
  IMPORT_STATEMENT as TS_IMPORT_STATEMENT,
  PROVIDER_PARAM_COMMENT,
} from './common/codeExample.constants'
import { formatParameters } from './common/formatParameters.utils'

import { ColorPalette } from '../../../configurator.types'

export function tsExample(params: CowSwapWidgetParams, defaultPalette: ColorPalette): string {
  return `${TS_IMPORT_STATEMENT} from '@cowprotocol/widget-lib'

const container = document.getElementById('<YOUR_CONTAINER>')

// ${COMMENTS_BEFORE_PARAMS}
const params: CowSwapWidgetParams = ${formatParameters(params, 0, true, defaultPalette)}

${PROVIDER_PARAM_COMMENT}
const provider = window.ethereum

const { updateParams } = createCowSwapWidget(container, { params, provider })`
}
