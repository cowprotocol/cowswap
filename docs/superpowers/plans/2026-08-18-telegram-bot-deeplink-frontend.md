# Telegram Bot Deep-Link Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Telegram Login Widget flow in `apps/cowswap-frontend/src/modules/notifications` with the bot deep-link flow, so connecting/disconnecting Telegram notifications never calls `oauth.telegram.org` and works inside an iframe (CoW Widget embed, Safe Apps).

**Architecture:** A new `bffTelegramApi` client talks to the three bff routes from the sibling `bff` plan. A new `useTelegramConnect` hook owns all state (subscribed?, connecting?, deep link, expiry) and replaces `useTgAuthorization` + `useTgSubscription`. `useConnectTelegram` becomes a thin adapter so `NotificationSettings.tsx`'s existing consumption (`useConnectTelegram()` → `<ConnectTelegram controller={...} />`) doesn't need to change. The Login Widget's inline button is replaced by a modal (link + QR code), following the existing `AffiliatePartnerQrModal` pattern.

**Tech Stack:** React hooks, `react-qrcode-logo` (already a dependency), Jest + `@testing-library/react` for hook tests.

**Spec:** `/Users/shoom/IdeaProjects/cowswap/docs/superpowers/specs/2026-08-18-telegram-bot-deeplink-notifications-design.md` (section "4. `cowswap-frontend`")

**Depends on:** the `bff` plan (`/Users/shoom/IdeaProjects/bff/docs/superpowers/plans/2026-08-18-telegram-bot-deeplink-backend.md`) for the three routes this calls. Tasks 1–2 here (API client, hook) can be built and unit-tested against a mocked `bffTelegramApi` before bff ships; Task 4's manual verification needs the real bff + cms deployed.

## Global Constraints

- Follow the `bffAffiliateApi.ts` pattern (`apps/cowswap-frontend/src/modules/affiliate/api/bffAffiliateApi.ts`) for the new bff client class — same `fetchWithTimeout`/`JSON_HEADERS`/`parseJsonResponse`/`unwrapOk` helpers from `@cowprotocol/common-utils`, same `BFF_BASE_URL` from `@cowprotocol/common-const`.
- Follow the `AffiliatePartnerQrModal` pattern (`apps/cowswap-frontend/src/modules/affiliate/containers/AffiliatePartnerQrModal.tsx`) for the new QR modal — same `react-qrcode-logo` usage, same `CowModal`/`ModalHeader` from `common/pure/Modal` / `@cowprotocol/ui`.
- The frontend never receives or stores a Telegram `hash`/`auth_date`/widget payload again — `TelegramData` shrinks to just what's needed for display.

---

### Task 1: `bffTelegramApi` client + shrink `TelegramData`

**Files:**
- Create: `apps/cowswap-frontend/src/modules/notifications/api/bffTelegramApi.ts`
- Modify: `apps/cowswap-frontend/src/modules/notifications/types.ts`

**Interfaces:**
- Produces: `bffTelegramApi.getConnectToken(account: string): Promise<{ token: string; deepLink: string }>`, `bffTelegramApi.getConnectStatus(account: string): Promise<{ connected: boolean; username?: string }>`, `bffTelegramApi.disconnect(account: string): Promise<void>` — all consumed by Task 2's `useTelegramConnect`.

- [ ] **Step 1: Shrink `TelegramData`**

Replace the contents of `apps/cowswap-frontend/src/modules/notifications/types.ts`:

```ts
// Telegram data shape used for display only — the frontend no longer holds
// widget auth payloads (hash/auth_date/id); the bot deep-link flow never
// exposes those to the browser.
export interface TelegramData {
  username?: string
}
```

- [ ] **Step 2: Implement `bffTelegramApi.ts`**

```ts
import { BFF_BASE_URL } from '@cowprotocol/common-const'
import {
  fetchWithTimeout,
  JSON_HEADERS,
  parseJsonResponse,
  stripTrailingSlash,
  unwrapOk,
} from '@cowprotocol/common-utils'
import type { FetchJsonResponse } from '@cowprotocol/common-utils'

export interface TelegramConnectTokenResponse {
  token: string
  deepLink: string
}

export interface TelegramConnectStatusResponse {
  connected: boolean
  username?: string
}

const TELEGRAM_API_TIMEOUT_MS = 10_000

class BffTelegramApi {
  private readonly baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = stripTrailingSlash(baseUrl)
  }

  private buildUrl(path: string): string {
    return `${this.baseUrl}/${path.replace(/^\//, '')}`
  }

  private async fetchJson<T>(path: string, init?: RequestInit): Promise<FetchJsonResponse<T>> {
    const response = await fetchWithTimeout(this.buildUrl(path), {
      method: 'GET',
      headers: JSON_HEADERS,
      ...init,
      timeout: TELEGRAM_API_TIMEOUT_MS,
      timeoutMessage: 'Unable to reach notifications service',
    })
    return parseJsonResponse<T>(response)
  }

  async getConnectToken(account: string): Promise<TelegramConnectTokenResponse> {
    const result = await this.fetchJson<TelegramConnectTokenResponse>(
      `accounts/${account}/telegram/connect-token`,
      { method: 'POST' }
    )
    return unwrapOk(result, 'Telegram connect-token response missing')
  }

  async getConnectStatus(account: string): Promise<TelegramConnectStatusResponse> {
    const result = await this.fetchJson<TelegramConnectStatusResponse>(`accounts/${account}/telegram/connect-status`)
    return unwrapOk(result, 'Telegram connect-status response missing')
  }

  async disconnect(account: string): Promise<void> {
    await this.fetchJson<{ success: boolean }>(`accounts/${account}/telegram/subscription`, { method: 'DELETE' })
  }
}

export const bffTelegramApi = new BffTelegramApi(BFF_BASE_URL)
```

- [ ] **Step 3: Type-check**

Run: `pnpm exec tsc --noEmit -p apps/cowswap-frontend/tsconfig.json` (or whatever the repo's existing type-check command is — check `package.json`'s `scripts` if this path is wrong).
Expected: no new type errors from these two files. (No runtime test here — this file is a thin wire-up, same as `bffAffiliateApi.ts` has no dedicated spec file; Task 2's hook test exercises it through a mock.)

- [ ] **Step 4: Commit**

```bash
git add apps/cowswap-frontend/src/modules/notifications/api/bffTelegramApi.ts apps/cowswap-frontend/src/modules/notifications/types.ts
git commit -m "feat(notifications): add bffTelegramApi client, shrink TelegramData"
```

---

### Task 2: `useTelegramConnect` hook

**Files:**
- Create: `apps/cowswap-frontend/src/modules/notifications/hooks/useTelegramConnect.ts`
- Test: `apps/cowswap-frontend/src/modules/notifications/hooks/useTelegramConnect.test.ts` (new)

**Interfaces:**
- Consumes: `bffTelegramApi` (Task 1).
- Produces: `useTelegramConnect(account: string | undefined): TelegramConnectController` where
  ```ts
  export type ConnectState = 'idle' | 'connecting' | 'expired'
  export interface TelegramConnectController {
    isLoading: boolean
    isSubscribed: boolean
    username?: string
    connectState: ConnectState
    deepLink: string | null
    connect(): Promise<void>
    cancelConnect(): void
    disconnect(): Promise<void>
  }
  ```
  Consumed by Task 3's `useConnectTelegram`/`ConnectTelegram`/`TelegramConnectionStatus`.

- [ ] **Step 1: Write the failing test**

Create `apps/cowswap-frontend/src/modules/notifications/hooks/useTelegramConnect.test.ts`:

```ts
import { act, renderHook, waitFor } from '@testing-library/react'

import { bffTelegramApi } from '../api/bffTelegramApi'
import { useTelegramConnect } from './useTelegramConnect'

jest.mock('../api/bffTelegramApi')

const mockedApi = bffTelegramApi as jest.Mocked<typeof bffTelegramApi>

describe('useTelegramConnect', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('loads the initial connect-status on mount', async () => {
    mockedApi.getConnectStatus.mockResolvedValue({ connected: true, username: 'ada' })

    const { result } = renderHook(() => useTelegramConnect('0xabc'))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.isSubscribed).toBe(true)
    expect(result.current.username).toBe('ada')
  })

  it('does not fetch status when there is no account', async () => {
    const { result } = renderHook(() => useTelegramConnect(undefined))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(mockedApi.getConnectStatus).not.toHaveBeenCalled()
  })

  it('connect() fetches a token, exposes the deep link, and polls until connected', async () => {
    mockedApi.getConnectStatus.mockResolvedValueOnce({ connected: false })
    mockedApi.getConnectToken.mockResolvedValue({ token: 'tok', deepLink: 'https://t.me/bot?start=tok' })
    mockedApi.getConnectStatus
      .mockResolvedValueOnce({ connected: false }) // first poll tick: still pending
      .mockResolvedValueOnce({ connected: true, username: 'ada' }) // second poll tick: connected

    const { result } = renderHook(() => useTelegramConnect('0xabc'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.connect()
    })

    expect(result.current.connectState).toBe('connecting')
    expect(result.current.deepLink).toBe('https://t.me/bot?start=tok')

    await act(async () => {
      jest.advanceTimersByTime(3_000)
      await Promise.resolve()
    })
    expect(result.current.isSubscribed).toBe(false)
    expect(result.current.connectState).toBe('connecting')

    await act(async () => {
      jest.advanceTimersByTime(3_000)
      await Promise.resolve()
    })
    expect(result.current.isSubscribed).toBe(true)
    expect(result.current.connectState).toBe('idle')
    expect(result.current.deepLink).toBeNull()
  })

  it('connect() moves to "expired" after the connect timeout elapses without success', async () => {
    mockedApi.getConnectStatus.mockResolvedValue({ connected: false })
    mockedApi.getConnectToken.mockResolvedValue({ token: 'tok', deepLink: 'https://t.me/bot?start=tok' })

    const { result } = renderHook(() => useTelegramConnect('0xabc'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.connect()
    })

    await act(async () => {
      jest.advanceTimersByTime(10 * 60 * 1000)
      await Promise.resolve()
    })

    expect(result.current.connectState).toBe('expired')
    expect(result.current.deepLink).toBeNull()
  })

  it('cancelConnect() stops polling and resets to idle', async () => {
    mockedApi.getConnectStatus.mockResolvedValue({ connected: false })
    mockedApi.getConnectToken.mockResolvedValue({ token: 'tok', deepLink: 'https://t.me/bot?start=tok' })

    const { result } = renderHook(() => useTelegramConnect('0xabc'))
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    await act(async () => {
      await result.current.connect()
    })
    act(() => {
      result.current.cancelConnect()
    })

    expect(result.current.connectState).toBe('idle')
    expect(result.current.deepLink).toBeNull()

    const callsBeforeAdvance = mockedApi.getConnectStatus.mock.calls.length
    await act(async () => {
      jest.advanceTimersByTime(10_000)
      await Promise.resolve()
    })
    expect(mockedApi.getConnectStatus.mock.calls.length).toBe(callsBeforeAdvance)
  })

  it('disconnect() calls the API and flips isSubscribed off', async () => {
    mockedApi.getConnectStatus.mockResolvedValue({ connected: true, username: 'ada' })
    mockedApi.disconnect.mockResolvedValue(undefined)

    const { result } = renderHook(() => useTelegramConnect('0xabc'))
    await waitFor(() => expect(result.current.isSubscribed).toBe(true))

    await act(async () => {
      await result.current.disconnect()
    })

    expect(mockedApi.disconnect).toHaveBeenCalledWith('0xabc')
    expect(result.current.isSubscribed).toBe(false)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec jest apps/cowswap-frontend/src/modules/notifications/hooks/useTelegramConnect.test.ts`
Expected: FAIL — cannot find module `./useTelegramConnect`.

- [ ] **Step 3: Implement `useTelegramConnect.ts`**

```ts
import { useCallback, useEffect, useRef, useState } from 'react'

import { bffTelegramApi } from '../api/bffTelegramApi'

const POLL_INTERVAL_MS = 3_000
const CONNECT_TIMEOUT_MS = 10 * 60 * 1000 // matches the bff connect-token TTL

export type ConnectState = 'idle' | 'connecting' | 'expired'

export interface TelegramConnectController {
  isLoading: boolean
  isSubscribed: boolean
  username?: string
  connectState: ConnectState
  deepLink: string | null
  connect(): Promise<void>
  cancelConnect(): void
  disconnect(): Promise<void>
}

export function useTelegramConnect(account: string | undefined): TelegramConnectController {
  const [isLoading, setIsLoading] = useState(true)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [username, setUsername] = useState<string | undefined>(undefined)
  const [connectState, setConnectState] = useState<ConnectState>('idle')
  const [deepLink, setDeepLink] = useState<string | null>(null)

  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const expiryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const stopConnecting = useCallback(() => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current)
    if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current)
    pollTimerRef.current = null
    expiryTimerRef.current = null
  }, [])

  const refreshStatus = useCallback(async (): Promise<boolean> => {
    if (!account) return false
    const status = await bffTelegramApi.getConnectStatus(account)
    setIsSubscribed(status.connected)
    setUsername(status.username)
    return status.connected
  }, [account])

  useEffect(() => {
    if (!account) {
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    refreshStatus().finally(() => setIsLoading(false))
  }, [account, refreshStatus])

  // Stop any in-flight polling/expiry timers on unmount
  useEffect(() => stopConnecting, [stopConnecting])

  const connect = useCallback(async () => {
    if (!account) return

    const { deepLink: link } = await bffTelegramApi.getConnectToken(account)
    setDeepLink(link)
    setConnectState('connecting')

    pollTimerRef.current = setInterval(() => {
      refreshStatus()
        .then((connected) => {
          if (connected) {
            stopConnecting()
            setConnectState('idle')
            setDeepLink(null)
          }
        })
        .catch(() => undefined)
    }, POLL_INTERVAL_MS)

    expiryTimerRef.current = setTimeout(() => {
      stopConnecting()
      setConnectState('expired')
      setDeepLink(null)
    }, CONNECT_TIMEOUT_MS)
  }, [account, refreshStatus, stopConnecting])

  const cancelConnect = useCallback(() => {
    stopConnecting()
    setConnectState('idle')
    setDeepLink(null)
  }, [stopConnecting])

  const disconnect = useCallback(async () => {
    if (!account) return
    await bffTelegramApi.disconnect(account)
    setIsSubscribed(false)
    setUsername(undefined)
  }, [account])

  return { isLoading, isSubscribed, username, connectState, deepLink, connect, cancelConnect, disconnect }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm exec jest apps/cowswap-frontend/src/modules/notifications/hooks/useTelegramConnect.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add apps/cowswap-frontend/src/modules/notifications/hooks/useTelegramConnect.ts apps/cowswap-frontend/src/modules/notifications/hooks/useTelegramConnect.test.ts
git commit -m "feat(notifications): add useTelegramConnect hook for the bot deep-link flow"
```

---

### Task 3: Wire the hook into the UI (adapter hook, modal, container, pure component)

**Files:**
- Modify: `apps/cowswap-frontend/src/modules/notifications/containers/ConnectTelegram/useConnectTelegram.tsx`
- Modify: `apps/cowswap-frontend/src/modules/notifications/containers/ConnectTelegram.tsx`
- Create: `apps/cowswap-frontend/src/modules/notifications/containers/ConnectTelegram/ConnectTelegramModal.tsx`
- Modify: `apps/cowswap-frontend/src/modules/notifications/pure/TelegramConnectionStatus/index.tsx`
- Modify: `apps/cowswap-frontend/src/modules/notifications/pure/TelegramConnectionStatus/index.cosmos.tsx`

**Interfaces:**
- Consumes: `useTelegramConnect`/`TelegramConnectController`/`ConnectState` (Task 2).
- Produces: `ConnectTelegramController` (same exported name `useConnectTelegram()` that `NotificationSettings.tsx` already imports, now just re-typed to `TelegramConnectController` — that container file needs no changes).

- [ ] **Step 1: Rewrite `useConnectTelegram.tsx`**

Replace its contents entirely:

```tsx
import { useWalletInfo } from '@cowprotocol/wallet'

import { TelegramConnectController, useTelegramConnect } from '../../hooks/useTelegramConnect'

export type ConnectTelegramController = TelegramConnectController

export function useConnectTelegram(): ConnectTelegramController {
  const { account } = useWalletInfo()

  return useTelegramConnect(account)
}
```

- [ ] **Step 2: Create the QR/deep-link modal**

Create `apps/cowswap-frontend/src/modules/notifications/containers/ConnectTelegram/ConnectTelegramModal.tsx`:

```tsx
import { ReactNode } from 'react'

import { ButtonOutlined, ButtonPrimary, ModalHeader, UI } from '@cowprotocol/ui'

import QRCode from 'react-qrcode-logo'
import styled from 'styled-components/macro'

import { CowModal } from 'common/pure/Modal'

import { ConnectState } from '../../hooks/useTelegramConnect'

const QR_SIZE_PX = 200

interface ConnectTelegramModalProps {
  isOpen: boolean
  connectState: ConnectState
  deepLink: string | null
  onRetry(): void
  onDismiss(): void
}

export function ConnectTelegramModal({
  isOpen,
  connectState,
  deepLink,
  onRetry,
  onDismiss,
}: ConnectTelegramModalProps): ReactNode {
  return (
    <CowModal isOpen={isOpen} onDismiss={onDismiss}>
      <ModalContent>
        <ModalHeader onClose={onDismiss}>Connect Telegram</ModalHeader>
        <ModalBody>
          {connectState === 'expired' ? (
            <>
              <Message>This link expired before you tapped Start in Telegram.</Message>
              <ButtonPrimary onClick={onRetry}>Get a new link</ButtonPrimary>
            </>
          ) : deepLink ? (
            <>
              <Message>Scan this code, or open the link on this device, then tap &ldquo;Start&rdquo; in the chat.</Message>
              <QrFrame>
                <QRCode value={deepLink} size={QR_SIZE_PX} quietZone={2} />
              </QrFrame>
              <ButtonOutlined as="a" href={deepLink} target="_blank" rel="noopener noreferrer">
                Open in Telegram
              </ButtonOutlined>
              <Status>Waiting for you to tap Start&hellip;</Status>
            </>
          ) : (
            <Message>Preparing your connect link&hellip;</Message>
          )}
        </ModalBody>
      </ModalContent>
    </CowModal>
  )
}

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 10px 20px 24px;
`

const QrFrame = styled.div`
  border-radius: 16px;
  border: 1px solid var(${UI.COLOR_PAPER_DARKER});
  padding: 16px;
  background: #fff;
`

const Message = styled.p`
  margin: 0;
  text-align: center;
  font-size: 13px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

const Status = styled.p`
  margin: 0;
  font-size: 12px;
  color: var(${UI.COLOR_TEXT_OPACITY_60});
`
```

If `ButtonPrimary` isn't exported from `@cowprotocol/ui` under that exact name, grep the lib for the actual name (`grep -rn "export.*Button" libs/ui/src`) and swap it in — everything else in this file follows `AffiliatePartnerQrModal.tsx`'s already-verified imports.

- [ ] **Step 3: Update `TelegramConnectionStatus`**

Replace `apps/cowswap-frontend/src/modules/notifications/pure/TelegramConnectionStatus/index.tsx`:

```tsx
import { ReactNode, useCallback, useState } from 'react'

import { Loader, UI, Toggle } from '@cowprotocol/ui'

import { ConnectTelegramModal } from '../../containers/ConnectTelegram/ConnectTelegramModal'
import { ConnectState } from '../../hooks/useTelegramConnect'

interface TelegramConnectionStatusProps {
  isLoading: boolean
  isSubscribed: boolean
  connectState: ConnectState
  deepLink: string | null
  connect(): Promise<void>
  cancelConnect(): void
  disconnect(): Promise<void>
}

export function TelegramConnectionStatus({
  isLoading,
  isSubscribed,
  connectState,
  deepLink,
  connect,
  cancelConnect,
  disconnect,
}: TelegramConnectionStatusProps): ReactNode {
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  const handleToggle = useCallback(async () => {
    if (isSubscribed) {
      setIsDisconnecting(true)
      try {
        await disconnect()
      } finally {
        setIsDisconnecting(false)
      }
    } else {
      await connect()
    }
  }, [isSubscribed, connect, disconnect])

  if (isLoading || isDisconnecting) {
    return <Loader size="33px" stroke={`var(${UI.COLOR_TEXT_OPACITY_50})`} />
  }

  return (
    <div>
      <Toggle
        id="toggle-telegram-notifications"
        checked={isSubscribed}
        toggle={handleToggle}
        inactiveBgColor={`var(${UI.COLOR_PAPER})`}
      />
      <ConnectTelegramModal
        isOpen={connectState !== 'idle'}
        connectState={connectState}
        deepLink={deepLink}
        onRetry={connect}
        onDismiss={cancelConnect}
      />
    </div>
  )
}
```

This drops the `needsAuthorization`/`authorize`/`subscribeWithData`/`toggleSubscription` props entirely — connecting and disconnecting are now just `connect()`/`disconnect()`, and "not yet linked" is simply `!isSubscribed`.

- [ ] **Step 4: Update the Cosmos story**

Replace `apps/cowswap-frontend/src/modules/notifications/pure/TelegramConnectionStatus/index.cosmos.tsx`:

```tsx
import { TelegramConnectionStatus } from './index'

const noop = (): void => {}
const asyncNoop = async (): Promise<void> => {}

const Fixtures = {
  loading: () => (
    <TelegramConnectionStatus
      isLoading={true}
      isSubscribed={false}
      connectState="idle"
      deepLink={null}
      connect={asyncNoop}
      cancelConnect={noop}
      disconnect={asyncNoop}
    />
  ),
  subscribed: () => (
    <TelegramConnectionStatus
      isLoading={false}
      isSubscribed={true}
      connectState="idle"
      deepLink={null}
      connect={asyncNoop}
      cancelConnect={noop}
      disconnect={asyncNoop}
    />
  ),
  notConnected: () => (
    <TelegramConnectionStatus
      isLoading={false}
      isSubscribed={false}
      connectState="idle"
      deepLink={null}
      connect={asyncNoop}
      cancelConnect={noop}
      disconnect={asyncNoop}
    />
  ),
  waitingForStart: () => (
    <TelegramConnectionStatus
      isLoading={false}
      isSubscribed={false}
      connectState="connecting"
      deepLink="https://t.me/cowNotificationsBot?start=preview-token"
      connect={asyncNoop}
      cancelConnect={noop}
      disconnect={asyncNoop}
    />
  ),
  linkExpired: () => (
    <TelegramConnectionStatus
      isLoading={false}
      isSubscribed={false}
      connectState="expired"
      deepLink={null}
      connect={asyncNoop}
      cancelConnect={noop}
      disconnect={asyncNoop}
    />
  ),
}

export default Fixtures
```

- [ ] **Step 5: Update `ConnectTelegram.tsx`**

Replace `apps/cowswap-frontend/src/modules/notifications/containers/ConnectTelegram.tsx`:

```tsx
import type { ReactElement } from 'react'

import { ConnectTelegramController } from './ConnectTelegram/useConnectTelegram'

import { TelegramConnectionStatus } from '../pure/TelegramConnectionStatus'

interface ConnectTelegramProps {
  controller: ConnectTelegramController
}

export function ConnectTelegram({ controller }: ConnectTelegramProps): ReactElement {
  const { isLoading, isSubscribed, connectState, deepLink, connect, cancelConnect, disconnect } = controller

  return (
    <TelegramConnectionStatus
      isLoading={isLoading}
      isSubscribed={isSubscribed}
      connectState={connectState}
      deepLink={deepLink}
      connect={connect}
      cancelConnect={cancelConnect}
      disconnect={disconnect}
    />
  )
}
```

The `Wrapper` styled-div and `wrapperRef` are gone — there's no widget script to mount into anymore.

- [ ] **Step 6: Type-check and run Cosmos**

Run: `pnpm exec tsc --noEmit -p apps/cowswap-frontend/tsconfig.json`
Expected: no errors. `NotificationSettings.tsx` needs no changes — it only reads `telegramController.username`, which `TelegramConnectController` still exposes.

Run: `pnpm --filter cowswap-frontend run cosmos` (or the repo's documented Cosmos command) and open `TelegramConnectionStatus` to click through all five fixtures, confirming the modal opens for `waitingForStart` and `linkExpired`.

- [ ] **Step 7: Commit**

```bash
git add apps/cowswap-frontend/src/modules/notifications/containers/ConnectTelegram.tsx apps/cowswap-frontend/src/modules/notifications/containers/ConnectTelegram/ apps/cowswap-frontend/src/modules/notifications/pure/TelegramConnectionStatus/
git commit -m "feat(notifications): replace Telegram widget UI with the deep-link/QR modal"
```

---

### Task 4: Remove the widget-flow code and stale docs

**Files:**
- Delete: `apps/cowswap-frontend/src/modules/notifications/services/getTelegramAuth.ts`
- Delete: `apps/cowswap-frontend/src/modules/notifications/hooks/useTgAuthorization.ts`
- Delete: `apps/cowswap-frontend/src/modules/notifications/hooks/useTgSubscription.tsx`
- Delete: `apps/cowswap-frontend/src/modules/notifications/atoms/tgSubscriptionAtom.ts`
- Modify: `apps/cowswap-frontend/src/modules/notifications/README.md`

**Interfaces:** None — this task only removes now-dead code confirmed unused by Tasks 1–3.

- [ ] **Step 1: Confirm nothing else references the files being deleted**

Run:
```bash
grep -rln "useTgAuthorization\|useTgSubscription\|getTelegramAuth\|tgSubscriptionAtom" apps/cowswap-frontend/src
```
Expected: only the files listed above (Task 3 already stopped importing them — `useConnectTelegram.tsx` no longer references `useTgAuthorization`/`useTgSubscription`). If anything else still matches, stop and re-check Task 3 before deleting.

- [ ] **Step 2: Delete the files**

```bash
git rm apps/cowswap-frontend/src/modules/notifications/services/getTelegramAuth.ts
git rm apps/cowswap-frontend/src/modules/notifications/hooks/useTgAuthorization.ts
git rm apps/cowswap-frontend/src/modules/notifications/hooks/useTgSubscription.tsx
git rm apps/cowswap-frontend/src/modules/notifications/atoms/tgSubscriptionAtom.ts
```

If `services/` or `atoms/` are now empty, remove the empty directories too (git doesn't track empty dirs, so no extra command is needed once the last file in each is removed).

- [ ] **Step 3: Update the module README**

Replace `apps/cowswap-frontend/src/modules/notifications/README.md`:

```markdown
# Notifications

## Local development

Telegram notifications are connected via a bot deep-link (`/start <token>`), not the Telegram Login Widget — the frontend only talks to the bff, never to `oauth.telegram.org` or the CMS directly.

To debug/develop Telegram subscriptions locally:
1. Point `REACT_APP_BFF_BASE_URL` at your local `bff` `apps/api` instance in `.env.local`.
2. Follow the `bff` repo's own local-dev instructions for `apps/api` and `apps/telegram` (these need `TELEGRAM_SECRET`, `CMS_BASE_URL`, `CMS_API_KEY`, and a Redis instance shared between the two apps).
3. Launch CoW Swap as usual (`pnpm run start`) — no bot id or Telegram-specific env var is needed on the frontend anymore.
```

- [ ] **Step 4: Remove the now-dead `REACT_APP_TG_BOT_ID` comment from `.env`**

Run `git diff apps/cowswap-frontend/.env` first — this file already has uncommitted local changes from earlier in this session; don't blindly overwrite it. Open the file, find the commented `# REACT_APP_TG_BOT_ID=3713371337` line (around line 146) and delete just that line, leaving the rest of the existing diff intact.

- [ ] **Step 5: Full check**

Run: `pnpm exec tsc --noEmit -p apps/cowswap-frontend/tsconfig.json` and `pnpm exec jest apps/cowswap-frontend/src/modules/notifications`
Expected: no errors, all notifications-module tests pass (including `getTrustedNotificationLink.test.ts`, unrelated but in the same directory tree).

- [ ] **Step 6: Commit**

```bash
git add -A apps/cowswap-frontend/src/modules/notifications apps/cowswap-frontend/.env
git commit -m "chore(notifications): remove the Telegram Login Widget flow"
```
