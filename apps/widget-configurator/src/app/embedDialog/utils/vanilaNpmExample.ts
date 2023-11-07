import type { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

import { formatParameters } from './formatParameters'

import { COMMENTS_BEFORE_PARAMS } from '../const'

export function vanilaNpmExample(params: CowSwapWidgetParams): string {
  return `
import { CowSwapWidgetParams, cowSwapWidget } from '@cowprotocol/widget-lib'

const container = document.getElementById('<YOUR_CONTAINER>')

// ${COMMENTS_BEFORE_PARAMS}
const params: CowSwapWidgetParams = ${formatParameters(params)}

const updateWidget = cowSwapWidget(container, params)
  `
}
