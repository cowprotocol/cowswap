# Brave Wallet Renderer Crash Investigation

## Summary

Brave tabs crashed on CoW Swap when Brave Wallet was enabled. The crash reproduced on
`swap.cow.fi`, local development builds, and local production builds. It did not reproduce
in Chrome or Firefox, and it stopped when Brave Wallet was disabled.

The final working mitigation is to keep Brave Wallet's EIP-6963 announcement hidden during
startup without reading, wrapping, logging, or redispatching its `detail.provider` object.
The provider is materialized only when the user explicitly opens the wallet modal.

## Confirmed Conditions

- Crashes happened in Brave with Brave Wallet enabled.
- Crashes also happened when the MetaMask extension was enabled alongside Brave Wallet.
- With Brave Wallet disabled and only MetaMask enabled, the app did not crash in the same
  test window.
- With both Brave Wallet and MetaMask disabled, the app did not crash.
- The crash required no user action after page load.
- Browser console logs did not show a final app exception close to the crash.

## CDP Evidence

A local Chrome DevTools Protocol recorder captured process, heap, DOM, and target-crash
state during the repro.

Important observations from the successful crash capture:

- CDP emitted `Inspector.targetCrashed`.
- CDP emitted `Target.targetCrashed` with `status: "crashed"` and `errorCode: 10`.
- The last healthy sample was about 0.4 seconds before the target crash.
- At the last healthy sample:
  - JS heap was stable, about `105.9 MB`.
  - The page renderer was about `722.6 MB`, CPU about `7%`.
  - GPU CPU was about `99%`.
  - Brave Wallet was still deferred from downstream dispatch.
- After the crash, page-level CDP calls timed out, but OS process sampling continued.

This means the tab target crashed inside Brave/Chromium; it was not a normal JavaScript
exception or React error boundary case.

## Root Cause

The root cause is Brave Wallet's EIP-6963 provider object being unsafe to materialize during
CoW Swap startup.

Before the fix, `interceptEIP6963Providers()` intercepted every `eip6963:announceProvider`
event and immediately read `detail.provider`, wrapped it with `createIsolatedProvider()`,
and logged the provider object. That happened even when the announcement was later deferred
from downstream wagmi/AppKit dispatch.

For Brave Wallet, that provider is a Brave-owned proxy object. The investigation showed that
deferring downstream dispatch was not enough: the page could still crash because our startup
interceptor had already touched the provider object.

The crash stopped only after Brave Wallet announcements were changed to store metadata and
the original event lazily, without reading `detail.provider` at all during startup.

## Retained Fix

The retained code path is intentionally small:

- Brave Wallet EIP-6963 announcements are stopped in capture phase and stored lazily.
- The lazy record contains only wallet metadata and the original event reference.
- `detail.provider` is not read until the explicit wallet modal path calls
  `flushDeferredProviders()`.
- Non-Brave EIP-6963 wallets keep the existing immediate wrapping behavior.
- Provider-object logging was removed from `createIsolatedProvider()` to avoid forcing
  browser/devtools inspection of wallet provider proxies.

Trade-off: Brave Wallet is no longer auto-materialized during startup. If the user wants to
connect Brave Wallet, the wallet modal path materializes and dispatches the deferred provider
intentionally.

## Rejected Or Removed Hypotheses

These changes were tested or explored but are not part of the final minimal fix:

- Moving `HydrateAtom` writes out of render phase. This removed a React warning but did not
  stop the Brave crash.
- Moving URL trade-state writes from `useMemo` to `useLayoutEffect`. This reduced render-phase
  risk but was not the crash root cause.
- Removing additional token-list subscriptions/fetching. This reduced startup work but was not
  necessary for the final fix.
- Suppressing all EIP-6963 request/announce flows until reconnect settled. The crash persisted
  because Brave's provider object was still being read/wrapped.
- Setting `activeProviderRef` to `PROVIDER_DISCONNECTED` after empty reconnect. This was not
  enough to prevent the crash.
- A `proxyByRdns` registry and config-side avoidance of `connector.getProvider()`. Not needed
  once Brave Wallet's provider is never materialized during startup.
- A Brave injected auto-reconnect storage guard. Plausible defensive path, but not supported by
  the final crash evidence.
- Request deduplication and circuit breaker logic inside provider isolation. Useful as a
  possible future hardening idea, but not needed for this bugfix.
- The CDP recorder script. It was diagnostic tooling only; the useful results are summarized
  here instead of keeping the script in the application diff.

## Verification Performed

- The regression test first failed against the old behavior because reading
  `detail.provider` happened immediately.
- After the fix, the regression test passes and proves Brave Wallet's provider getter is not
  read until `flushDeferredProviders()` runs.
- Manual Brave verification after the fix:
  - several minutes idle with Brave Wallet enabled: no crash
  - interactive app usage: no crash
  - Brave Wallet plus MetaMask extension enabled: no crash in the same test window

## Follow-Up Risk

This is an app-side mitigation for a Brave/Brave Wallet renderer crash. It avoids the known
trigger, but it cannot guarantee Brave will not crash if Brave Wallet itself has another
provider-proxy failure path. If crashes return, the next useful data is another CDP capture
showing whether `Target.targetCrashed` still occurs before any Brave provider materialization.
