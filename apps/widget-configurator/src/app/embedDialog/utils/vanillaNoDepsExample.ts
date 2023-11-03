import type { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

export function vanillaNoDepsExample(params: CowSwapWidgetParams): string {
  const paramsSanitized = {
    ...params,
    provider: `<eip-1193 provider>`,
  }

  return `
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CoWSwap Widget demo</title>
  <script src="https://cdn.jsdelivr.net/npm/@cowprotocol/widget-lib@latest/index.iife.js"></script>
</head>
<body>
  <div id="app"></div>
  <script>
    const params = ${JSON.stringify(paramsSanitized, null, 4)}

    cowSwapWidget.cowSwapWidget(document.getElementById("app"), params)
  </script>
</body>
</html>
  `
}
