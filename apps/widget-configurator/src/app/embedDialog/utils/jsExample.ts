import { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

import { formatParameters } from './formatParameters'

import { ColorPalette } from '../../configurator/types'
import { COMMENTS_BEFORE_PARAMS } from '../const'

export function jsExample(params: CowSwapWidgetParams, defaultPalette: ColorPalette): string {
  return `
import { cowSwapWidget } from '@cowprotocol/widget-lib'

const container = document.getElementById('<YOUR_CONTAINER>')

// ${COMMENTS_BEFORE_PARAMS}
const params = ${formatParameters(params, 0, false, defaultPalette)}

const updateWidget = cowSwapWidget(container, params)
  `
}
