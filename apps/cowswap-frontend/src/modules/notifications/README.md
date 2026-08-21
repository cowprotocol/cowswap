# Notifications

## Local development

Telegram notifications are connected via a bot deep-link (`/start <token>`), not the Telegram Login Widget — the frontend only talks to the bff, never to `oauth.telegram.org` or the CMS directly.

To debug/develop Telegram subscriptions locally:
1. Point `REACT_APP_BFF_BASE_URL` at your local `bff` `apps/api` instance in `.env.local`.
2. Follow the `bff` repo's own local-dev instructions for `apps/api` and `apps/telegram` (these need `TELEGRAM_SECRET`, `CMS_BASE_URL`, `CMS_API_KEY`, and a Redis instance shared between the two apps).
3. Launch CoW Swap as usual (`pnpm run start`) — no bot id or Telegram-specific env var is needed on the frontend anymore.
