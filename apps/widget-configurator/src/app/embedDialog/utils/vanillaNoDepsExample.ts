import type { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

import { formatParameters } from './formatParameters'

import { COMMENTS_BEFORE_PARAMS } from '../const'

export function vanillaNoDepsExample(params: CowSwapWidgetParams): string {
  return `
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CoWSwap Widget demo</title>
  <script src="https://cdn.jsdelivr.net/npm/@cowprotocol/widget-lib@latest/index.iife.js"></script>
</head>
<body style="display: flex; align-items: center; justify-content: center; background-color: #06172e; padding: 10px;">
  <div id="app"></div>
  <script>
    // ${COMMENTS_BEFORE_PARAMS}
    const params = ${formatParameters(params, 4)}

    cowSwapWidget.cowSwapWidget(document.getElementById("app"), params)
  </script>
</body>
</html>
  `
}
