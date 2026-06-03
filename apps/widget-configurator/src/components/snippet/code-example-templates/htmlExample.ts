import { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

import { COMMENTS_BEFORE_PARAMS, PROVIDER_PARAM_COMMENT_LINES } from './common/codeExample.constants'
import { formatParameters } from './common/formatParameters.utils'

import { ColorPalette } from '../../../configurator.types'

export function vanillaNoDepsExample(params: CowSwapWidgetParams, defaultPalette: ColorPalette): string {
  return `<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CoWSwap Widget demo</title>
  <script src="https://cdn.jsdelivr.net/npm/@cowprotocol/widget-lib@latest/index.iife.js"></script>
</head>
<body
  style="
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #06172e;
    padding: 10px;
  "
>
  <div id="app"></div>
  <script>
    // ${COMMENTS_BEFORE_PARAMS}
    const params = ${formatParameters(params, 4, false, defaultPalette)}

    ${PROVIDER_PARAM_COMMENT_LINES.map((line) => `// ${line}`).join('\n    ')}
    const provider = window.ethereum

    const { updateParams } = cowSwapWidget.createCowSwapWidget(
      document.getElementById("app"),
      { params, provider }
    )
  </script>
</body>
</html>`
}
