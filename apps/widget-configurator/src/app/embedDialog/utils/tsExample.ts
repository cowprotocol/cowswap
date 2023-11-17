import type { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

import { formatParameters } from './formatParameters'

import { COMMENTS_BEFORE_PARAMS, IMPORT_STATEMENT as TS_IMPORT_STATEMENT } from '../const'

export function tsExample(params: CowSwapWidgetParams): string {
  return `
${TS_IMPORT_STATEMENT} from '@cowprotocol/widget-lib'

const container = document.getElementById('<YOUR_CONTAINER>')

// ${COMMENTS_BEFORE_PARAMS}
const params: CowSwapWidgetParams = ${formatParameters(params, 0, true)}

const updateWidget = cowSwapWidget(container, params)
  `
}
