import { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

import { COMMENTS_BEFORE_PARAMS, PROVIDER_PARAM_COMMENT_LINES } from './common/codeExample.constants'
import { escapeJsonForInlineScript } from './common/escapeJsonForInlineScript.utils'
import { formatParameters } from './common/formatParameters.utils'

import { ColorPalette } from '../../../configurator.types'

/**
 * Standalone HTML embed snippet for the configurator "Pure HTML" tab.
 *
 * Preview safety: `Snippet` renders this string with `react-syntax-highlighter` (highlight.js
 * engine), which tokenizes the source and mounts React elements with text-node children
 * instead of `dangerouslySetInnerHTML`. User-controlled param values therefore appear as
 * inert highlighted text in the modal and do not execute in the configurator DOM.
 *
 * Copied snippet / self-injection: params JSON is escaped for inline `<script>` embedding
 * via `escapeJsonForInlineScript` so a `</script>` substring in a value cannot close the
 * element early. Only the integrator who configured and copied the snippet can poison their
 * own deploy.
 *
 * If we have a config save/load feature, we'll need to sanitize or escape loaded data first.
 */
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
    const params = ${escapeJsonForInlineScript(formatParameters(params, 4, false, defaultPalette))}

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
