const cache: Record<string, unknown> = {}

export function printJson(json: { key: string; data: unknown }): void {
  const ID = '__json_debug__'

  let div = document.getElementById(ID)

  if (!div) {
    div = document.createElement('div')
    div.id = ID

    div.style.cssText = `
      position: relative;
      box-sizing: border-box;
      width: 100%;
      padding: 12px;
      background: #1e1e1e;
      color: #d4d4d4;
      font: 12px/1.5 monospace;
      white-space: pre-wrap;
      border-bottom: 1px solid #444;
      z-index: 2147483647;
      max-height: 400px;
      overflow-y: scroll;
    `

    document.getElementById('cowswap-app-header')?.parentNode?.prepend(div)
  }

  cache[json.key] = json.data

  div.textContent = JSON.stringify(cache, null, 2)
}
