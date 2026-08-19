---
title: Telegram notifications via bot deep-link (replace Login Widget)
date: 2026-08-18
status: approved
owner: alexandr@cow.fi
repos:
  - cowswap (apps/cowswap-frontend)
  - bff (apps/api, apps/telegram)
  - cms (src/api/telegram-subscription)
---

# Telegram notifications via bot deep-link (replace Login Widget)

## Why

`useConnectTelegram` (`apps/cowswap-frontend/src/modules/notifications/containers/ConnectTelegram/useConnectTelegram.tsx`)
currently authorizes the Telegram notification bot via the Telegram Login
Widget: it loads `telegram-widget.js`, calls the documented
`window.Telegram.Login.auth()` popup API, and — critically — also calls a
reverse-engineered, undocumented endpoint (`getTelegramAuth.ts` →
`https://oauth.telegram.org/auth/get`) both as a silent "already logged in"
check on mount/every 3s, and as a fallback inside the popup flow.

That endpoint is designed to run first-party inside Telegram's own iframe. When
cowswap-frontend itself runs inside an iframe — as the CoW Widget guest
(`libs/widget-lib`, `apps/widget-configurator`) or as a Safe Apps guest
(`useIsSafeApp`) — the request becomes cross-site-in-a-nested-iframe, and
browsers' third-party-cookie/SameSite partitioning blocks it, surfacing as a
CORS error. This is not fixable by changing headers on our side; it's an
unsupported dependency in that context.

This design replaces the widget flow with a Telegram Bot deep-link
(`/start <token>`) flow, which never touches `oauth.telegram.org` from the
browser — it is either a plain link tap (top-level navigation, immune to
iframe/CORS/cookie restrictions) or a server-to-server call.

## Constraints decided up front

| Decision | Choice | Rationale |
|---|---|---|
| Scope | Full replacement of the Login Widget, everywhere (not iframe-only fallback) | One auth code path to maintain; deep-link UX works identically top-level and embedded. |
| CMS write path | New CMS-internal endpoints (`link-via-bot` / `unlink-via-bot`), not a hash-signing hack in bff | CMS repo is available to edit; a dedicated internal endpoint is clearer/more maintainable than replicating Strapi's HMAC verification in bff. |
| Disconnect | New bff `DELETE` endpoint mirrors the connect flow | Keeps the existing in-app toggle-off UX working, rather than pushing users to a bot `/stop` command. |
| Token store | Redis-backed `CacheRepository` (already used elsewhere in bff), shared between `apps/api` and `apps/telegram` | Reuses existing infra; **requires Redis to be enabled in every environment this runs in** — see Risks. |
| CMS auth for new routes | Existing `CMS_API_KEY` bearer token bff already holds, routes excluded from the "Public" Strapi role | No new secret to provision/rotate. Requires one manual Strapi-admin permission grant (see Rollout). |
| Bot username source | `bot.getMe()` fetched once by `apps/api` and cached in-process | Avoids a new env var that must stay in sync with the bot token; falls back to env var if `getMe()` fails at boot. |

## Architecture

```
                                cowswap-frontend
                                       │
                    1. POST /accounts/:account/telegram/connect-token
                                       ▼
                              bff / apps/api (Fastify)
                    generates random token, stores in Redis
                    (CacheRepository) as telegram-connect:<token> -> account, TTL 10m
                                       │
                    returns { token, deepLink: t.me/<bot>?start=<token> }
                                       ▼
                                cowswap-frontend
                  shows "Open in Telegram" link + QR, starts polling
                    GET /accounts/:account/telegram/connect-status
                                       │
                          user taps deepLink (top-level nav)
                                       ▼
                                  Telegram app
                                       │
                              sends "/start <token>"
                                       ▼
                        bff / apps/telegram (already polling)
              resolves token -> account via same Redis CacheRepository
                     (deletes token: single-use), then calls
                                       │
                                       ▼
                cms: POST /telegram-subscription/link-via-bot
             { account, chatId, firstName, username }  (CMS_API_KEY auth)
                                       │
                     writes telegram_subscriptions row directly
                        (no hash / verifyTgAuthentication needed)
                                       │
                bot replies in Telegram chat: success / expired-token
                                       │
        cowswap-frontend's poll of connect-status flips to { connected: true }
```

Disconnect mirrors this: `DELETE /accounts/:account/telegram/subscription` on
`apps/api` calls `cms: POST /telegram-subscription/unlink-via-bot { account }`.

## Component changes

### 1. `cms` (`/Users/shoom/IdeaProjects/cms`)

No schema migration: `telegram_subscriptions` already has `hash`, `authDate`,
`photoUrl` as optional; only `account` is required.

- `src/api/telegram-subscription/controllers/telegram-subscription.ts`: add
  `linkViaBot(context)` and `unlinkViaBot(context)`. Both skip
  `verifyTgAuthentication` entirely — trust comes from the route not being
  public, not from a per-request hash. `linkViaBot` calls the existing
  `service.addSubscription(account, { id: chatId, first_name, username, auth_date: now, hash: null })`
  (or a slightly widened service signature that makes `hash`/`photo_url`
  optional — trivial, since the DB columns already are). `unlinkViaBot` calls
  the existing `service.removeSubscriptions(account)` unchanged.
- `src/api/telegram-subscription/routes/telegram-subscription.ts`: add
  `POST /telegram-subscription/link-via-bot` and
  `POST /telegram-subscription/unlink-via-bot`.
- These two routes must **not** be granted to the Strapi "Public" role
  (unlike `add-tg-subscription`/`remove-tg-subscription`/`check-tg-subscription`,
  which are public because the browser calls them directly today). Strapi's
  built-in API-token auth then gates them.

### 2. `bff` — `apps/api`

New file `apps/api/src/app/routes/accounts/_account/telegram/index.ts`
(sibling of the existing `accounts/_account/notifications.ts`), following the
same `isCmsEnabled` guard and inversify-container lookup pattern:

- `POST /accounts/:account/telegram/connect-token` — generates a token via
  `crypto.randomBytes(16).toString('hex')`, `cacheRepository.set('telegram-connect:' + token, account, 600)`,
  returns `{ token, deepLink }` where `deepLink` is built from the bot
  username (`bot.getMe()`, cached in-process at startup) and the token.
- `GET /accounts/:account/telegram/connect-status` — calls the existing
  `PushSubscriptionsRepository.getAllTelegramSubscriptionsForAccounts([account])`,
  returns `{ connected: boolean, username?: string }`.
- `DELETE /accounts/:account/telegram/subscription` — calls the CMS
  `unlink-via-bot` endpoint, returns `{ success: boolean }`.

### 3. `bff` — `apps/telegram`

`apps/telegram/src/main.ts` currently only sends messages. Add, before/alongside
`mainLoop()`:

- `telegramBot.on('message', handler)` where `handler` matches `/^\/start\s+(\S+)$/`
  against `msg.text`.
- On match: read `telegram-connect:<token>` from the same
  `CacheRepository`/Redis instance `apps/api` writes to (via `getCacheRepository()`
  from `@cowprotocol/services`), delete the key immediately (single-use), then
  call `POST cms/telegram-subscription/link-via-bot` with
  `{ account, chatId: msg.chat.id, firstName: msg.from.first_name, username: msg.from.username }`.
- Reply in-chat: success message on link, or "This link has expired — please
  reconnect from CoW Swap" if the token was missing/already used.

### 4. `cowswap-frontend` — `apps/cowswap-frontend/src/modules/notifications/`

Removed:
- `services/getTelegramAuth.ts` (the `oauth.telegram.org/auth/get` XHR).
- Widget-script loading, `Telegram.Login.auth`/`AUTH_OPTIONS`, and the silent
  re-check/poll in `hooks/useTgAuthorization.ts`.
- The `TelegramData`-with-`hash` payload building in `hooks/useTgSubscription.tsx`
  and its direct `getCmsClient().POST('/add-tg-subscription' | '/remove-tg-subscription' | '/check-tg-subscription', ...)`
  calls — the browser no longer talks to the CMS directly for this flow at all.

Added:
- `common/services/bff` (or a module-local file, following the
  `bffAffiliateApi.ts` pattern) — `bffTelegramApi.ts` with
  `getConnectToken(account)`, `getConnectStatus(account)`, `disconnect(account)`.
- A replacement for `useConnectTelegram` that: calls `getConnectToken` on
  demand (not eagerly on mount, since there's no more "already logged in"
  widget concept to silently probe), exposes the `deepLink` for a
  `ConnectTelegram` UI to render as a link + QR code, polls
  `getConnectStatus` every 3s while a connect attempt is pending, and stops
  polling once `connected: true` or the token's 10-minute TTL has elapsed
  (surface a "link expired, try again" state).
- `ConnectTelegram` container drops `wrapperRef` (no more DOM node for the
  widget script) and `TelegramConnectionStatus` gets a new "waiting for you to
  tap the Telegram link" visual state instead of the widget's inline button.

`types.ts`'s `TelegramData` shrinks to `{ username?: string }` — the frontend
never sees `hash`/`auth_date`/`id` again.

## Error handling

- **Token expiry**: bot replies with an explicit expired-token message;
  frontend's own poll times out after the same TTL and shows a "try again"
  state rather than polling forever.
- **CMS/bff unreachable during `/start` handling**: bot replies with a generic
  "something went wrong, please try again" and does *not* delete the Redis
  key before the CMS call succeeds, so a transient failure is retryable by the
  user re-sending `/start <token>` (same token, still valid until TTL).
- **Redis unavailable**: `getCacheRepository()` silently falls back to
  `CacheRepositoryMemory()` per-process today. Since `apps/api` and
  `apps/telegram` are separate processes, this would make every token
  unresolvable. This is treated as a hard deploy requirement, not handled in
  code — see Risks.

## Testing

- CMS: unit test for `linkViaBot`/`unlinkViaBot` controller actions (mock
  `strapi.service`), and a route-level check that the new paths are absent
  from the Public role fixture/seed if one exists.
- bff `apps/api`: route tests for the three new endpoints against a fake
  `PushSubscriptionsRepository`/`CacheRepository`, following existing tests
  under `apps/api/src/app/routes/**/*.spec.ts` conventions.
- bff `apps/telegram`: unit test the `/start` handler against a mocked bot
  and `CacheRepository` (token found / not found / CMS call fails).
- cowswap-frontend: hook test for the new connect hook (token fetch → poll →
  connected), and a Cosmos story update for `TelegramConnectionStatus`'s new
  "waiting" state.
- Manual E2E: cannot fully verify the iframe-CORS fix without an actual
  embedded (CoW Widget or Safe App) deployment; note this explicitly when
  reporting the fix rather than claiming it's verified end-to-end from
  automated tests alone.

## Rollout

1. Ship CMS changes first (additive, no behavior change for existing
   endpoints) and deploy.
2. Manually grant the bff API token permission for `link-via-bot` /
   `unlink-via-bot` in the Strapi admin (Settings → API Tokens).
3. Confirm Redis is enabled (`REDIS_URL`/equivalent) in every environment
   `apps/api` and `apps/telegram` run in — required for the token handoff to
   work at all.
4. Ship bff changes (`apps/api` routes + `apps/telegram` handler), deploy.
5. Ship cowswap-frontend changes last, once the above are live in the target
   environment(s).

## Risks

- **Shared Redis is load-bearing and silent-failing.** If it's ever disabled
  or the two bff apps end up pointed at different Redis instances, connect
  tokens simply never resolve, with no error surfaced beyond "link expired"
  to the user. Worth a startup log/assertion in both apps if Redis is
  disabled, even though this design doesn't add new fallback logic for it.
- **Manual Strapi permission grant** is an out-of-git operational step and
  easy to forget when replicating to a new environment (e.g. a fresh staging
  CMS instance).
