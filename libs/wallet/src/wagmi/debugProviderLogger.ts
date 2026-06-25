// DEBUG-ONLY: instrument an injected EIP-1193 provider so every `request` is
// logged with its status. A call that stays "⏳ pending" forever is the hang.
// Remove this file (and its use in `getInjectedProvider`) once debugging is done.
import type { EIP1193Provider } from 'viem'

type RpcStatus = 'pending' | 'ok' | 'error'
type RpcLog = { id: number; method: string; status: RpcStatus; ms?: number; error?: string }

const PATCH_FLAG = '__rpcLoggingPatched__'
const logs: RpcLog[] = []
let seq = 0
let collapsed = false

function render(): void {
  if (typeof document === 'undefined') return
  const ID = '__rpc_debug__'
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
      background: #111;
      color: #0f0;
      font: 11px/1.4 monospace;
      border-bottom: 1px solid #444;
      z-index: 2147483647;
    `

    header = document.createElement('div')
    header.id = `${ID}__header`
    header.style.cssText = `padding: 6px 12px; cursor: pointer; user-select: none; background: #000; border-bottom: 1px solid #333;`
    header.onclick = (): void => {
      collapsed = !collapsed
      render()
    }

    body = document.createElement('div')
    body.id = `${ID}__body`
    body.style.cssText = `padding: 12px; white-space: pre-wrap; max-height: 300px; overflow-y: scroll;`

    div.appendChild(header)
    div.appendChild(body)
    document.getElementById('cowswap-app-header')?.parentNode?.prepend(div)
  }

  const pending = logs.filter((l) => l.status === 'pending').length
  if (header) header.textContent = `${collapsed ? '▶' : '▼'} RPC log — ${logs.length} calls, ${pending} pending`
  if (body) {
    body.style.display = collapsed ? 'none' : 'block'
    body.textContent = logs
      .map((l) => {
        const icon = l.status === 'pending' ? '⏳' : l.status === 'ok' ? '✅' : '❌'
        const ms = l.ms != null ? ` (${l.ms}ms)` : ''
        const err = l.error ? ` — ${l.error}` : ''
        return `${icon} #${l.id} ${l.method}${ms}${err}`
      })
      .join('\n')
  }
}

export function patchProviderLogging(provider: EIP1193Provider | undefined): EIP1193Provider | undefined {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const anyProvider = provider as any
  if (!provider || anyProvider[PATCH_FLAG]) return provider
  anyProvider[PATCH_FLAG] = true

  const originalRequest = provider.request.bind(provider) as (args: {
    method: string
    params?: unknown
  }) => Promise<unknown>

  anyProvider.request = (args: { method: string; params?: unknown }) => {
    const entry: RpcLog = { id: ++seq, method: args?.method ?? 'unknown', status: 'pending' }
    logs.push(entry)
    console.log('AAAAAAA rpc →', entry.id, entry.method, args?.params)
    render()

    const start = performance.now()
    return originalRequest(args).then(
      (res: unknown) => {
        entry.status = 'ok'
        entry.ms = Math.round(performance.now() - start)
        console.log('AAAAAAA rpc ✅', entry.id, entry.method, entry.ms + 'ms')
        render()
        return res
      },
      (err: unknown) => {
        entry.status = 'error'
        entry.ms = Math.round(performance.now() - start)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        entry.error = (err as any)?.message ?? String(err)
        console.log('AAAAAAA rpc ❌', entry.id, entry.method, entry.error)
        render()
        throw err
      },
    )
  }

  return provider
}
