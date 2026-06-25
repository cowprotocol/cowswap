const cache: Record<string, unknown> = {}
let collapsed = false

export function printJson(json: { key: string; data: unknown }): void {
  const ID = '__json_debug__'

  let div = document.getElementById(ID)
  let header = document.getElementById(`${ID}__header`)
  let body = document.getElementById(`${ID}__body`)

  if (!div) {
    div = document.createElement('div')
    div.id = ID
    div.style.cssText = `
      position: relative;
      box-sizing: border-box;
      width: 100%;
      background: #1e1e1e;
      color: #d4d4d4;
      font: 12px/1.5 monospace;
      border-bottom: 1px solid #444;
      z-index: 2147483647;
    `

    header = document.createElement('div')
    header.id = `${ID}__header`
    header.style.cssText = `padding: 6px 12px; cursor: pointer; user-select: none; background: #000; border-bottom: 1px solid #333;`
    header.onclick = (): void => {
      collapsed = !collapsed
      renderPanel()
    }

    body = document.createElement('div')
    body.id = `${ID}__body`
    body.style.cssText = `padding: 12px; white-space: pre-wrap; max-height: 400px; overflow-y: scroll;`

    div.appendChild(header)
    div.appendChild(body)
    document.getElementById('cowswap-app-header')?.parentNode?.prepend(div)
  }

  cache[json.key] = json.data
  renderPanel()
}

function renderPanel(): void {
  const ID = '__json_debug__'
  const header = document.getElementById(`${ID}__header`)
  const body = document.getElementById(`${ID}__body`)

  if (header) header.textContent = `${collapsed ? '▶' : '▼'} JSON debug — ${Object.keys(cache).length} keys`
  if (body) {
    body.style.display = collapsed ? 'none' : 'block'
    body.textContent = JSON.stringify(cache, null, 2)
  }
}
