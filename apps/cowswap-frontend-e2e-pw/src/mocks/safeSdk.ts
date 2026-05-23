import type { BrowserContext } from '@playwright/test'

export interface SafeSdkMock {
  enable(opts: { chainId: number; safeAddress: string }): Promise<void>
  disable(): Promise<void>
}

export function installSafeSdk(context: BrowserContext): SafeSdkMock {
  let enabled: { chainId: number; safeAddress: string } | null = null

  async function applyInitScript(): Promise<void> {
    if (!enabled) return
    const { chainId, safeAddress } = enabled
    await context.addInitScript(
      ({ chainId, safeAddress }: { chainId: number; safeAddress: string }) => {
        // Pose as embedded in a Safe iframe.
        Object.defineProperty(window, 'parent', { value: window, configurable: true })
        const realPostMessage = window.postMessage.bind(window)
        const newPostMessage: typeof window.postMessage = (
          message: unknown,
          targetOrigin?: string | WindowPostMessageOptions,
          transfer?: Transferable[],
        ) => {
          const msg = message as { id?: string; method?: string }
          if (msg && typeof msg.method === 'string' && msg.method.startsWith('safe_')) {
            const reply = {
              id: msg.id,
              success: true,
              version: '1.0.0',
              data:
                msg.method === 'getSafeInfo'
                  ? { safeAddress, chainId, threshold: 1, owners: [safeAddress], isReadOnly: false }
                  : msg.method === 'getEnvironmentInfo'
                    ? { origin: 'https://app.safe.global' }
                    : {},
            }
            setTimeout(() => window.dispatchEvent(new MessageEvent('message', { data: reply, source: window })), 0)
            return
          }
          if (typeof targetOrigin === 'string') {
            realPostMessage(message, targetOrigin, transfer)
            return
          }
          realPostMessage(message, targetOrigin ?? { targetOrigin: '*' })
        }
        window.postMessage = newPostMessage
      },
      { chainId, safeAddress },
    )
  }

  return {
    async enable(opts) {
      enabled = opts
      await applyInitScript()
    },
    async disable() {
      enabled = null
      // addInitScript persists for the context's lifetime; per-test isolation comes from fresh context.
    },
  }
}
