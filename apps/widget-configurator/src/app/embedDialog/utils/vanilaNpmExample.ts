import type { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

import { sanitizeParameters } from './sanitizeParameters'

export function vanilaNpmExample(params: CowSwapWidgetParams): string {
  const paramsSanitized = sanitizeParameters(params)

  return `
import { CowSwapWidgetParams, cowSwapWidget } from '@cowprotocol/widget-lib'

const container = document.getElementById('<YOUR_CONTAINER>')

const params: CowSwapWidgetParams = ${paramsSanitized}

const updateWidget = cowSwapWidget(container, params)
  `
}
