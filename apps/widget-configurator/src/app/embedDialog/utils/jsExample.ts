import { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

import { formatParameters } from './formatParameters'

import { ColorPalette } from '../../configurator/types'
import { COMMENTS_BEFORE_PARAMS, PROVIDER_PARAM_COMMENT } from '../const'

export function jsExample(params: CowSwapWidgetParams, defaultPalette: ColorPalette): string {
  return `
import { createCowSwapWidget } from '@cowprotocol/widget-lib'

const container = document.getElementById('<YOUR_CONTAINER>')

// ${COMMENTS_BEFORE_PARAMS}
const params = ${formatParameters(params, 0, false, defaultPalette)}

// ${PROVIDER_PARAM_COMMENT}
const provider = window.ethereum

const { updateParams } = createCowSwapWidget(container, { params, provider })
  `
}
