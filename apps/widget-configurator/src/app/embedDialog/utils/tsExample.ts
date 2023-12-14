import type { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

import { formatParameters } from './formatParameters'

import { ColorPalette } from '../../configurator/types'
import { COMMENTS_BEFORE_PARAMS, IMPORT_STATEMENT as TS_IMPORT_STATEMENT } from '../const'

export function tsExample(params: CowSwapWidgetParams, defaultPalette: ColorPalette): string {
  return `
${TS_IMPORT_STATEMENT} from '@cowprotocol/widget-lib'

const container = document.getElementById('<YOUR_CONTAINER>')

// ${COMMENTS_BEFORE_PARAMS}
const params: CowSwapWidgetParams = ${formatParameters(params, 0, true, defaultPalette)}

const updateWidget = cowSwapWidget(container, params)
  `
}
