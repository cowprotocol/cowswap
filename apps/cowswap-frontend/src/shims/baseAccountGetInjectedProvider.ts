/**
 * Vite-aliased replacement for `@base-org/account/dist/interface/builder/core/getInjectedProvider.js`.
 *
 * The SDK at v2.4.0 (pinned exactly by @reown/appkit-utils@1.8.19) reads
 * `window.top?.ethereum` without a try/catch. Inside the widget configurator's
 * cross-origin iframe, reading any property on a cross-origin Window throws a
 * synchronous SecurityError — the `?.` only short-circuits null/undefined. That
 * aborts the Base Account wagmi connector's `connect()` before its popup can open,
 * leaving the AppKit modal stuck on "Connection declined".
 *
 * Upstream fixed this in @base-org/account@2.5.x by wrapping the body in try/catch,
 * but AppKit pins the buggy 2.4.0 exactly and bumping it is blocked by the repo's
 * minimumReleaseAge policy. Vite resolve.alias redirects the buggy file to this
 * shim at build/dev time — no node_modules patching required.
 */

const TBA_PROVIDER_IDENTIFIER = 'isCoinbaseBrowser'

interface InjectedProvider {
  [TBA_PROVIDER_IDENTIFIER]?: boolean
}

export function getInjectedProvider(): InjectedProvider | null {
  try {
    const topWindow = (window as Window).top
    const injectedProvider: InjectedProvider | undefined =
      (topWindow as unknown as { ethereum?: InjectedProvider })?.ethereum ??
      (window as unknown as { ethereum?: InjectedProvider }).ethereum
    if (injectedProvider?.[TBA_PROVIDER_IDENTIFIER]) {
      return injectedProvider
    }
    return null
  } catch {
    // Cross-origin parent window (widget iframe served from another origin).
    return null
  }
}
