import type { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

export function vanilaNpmExample(params: CowSwapWidgetParams): string {
  const paramsSanitized = {
    ...params,
    provider: `<eip-1193 provider>`,
  }

  return `
import { CowSwapWidgetParams, cowSwapWidget } from '@cowprotocol/widget-lib'

const container = document.getElementById('<YOUR_CONTAINER>')

const params: CowSwapWidgetParams = ${JSON.stringify(paramsSanitized, null, 4)}

const updateWidget = cowSwapWidget(container, params)
  `
}
