# Captcha

Turnstile is mounted in swap, limit, yield, and twap forms through `containers/CaptchaWidget.container.tsx`.

On success, `api/captchaApi.ts` exchanges the Turnstile token for a JWT, `entities/captcha/state/captchaJwtAtom.ts` stores it, and `CaptchaWidget` applies it through `setBearerToken()`.

Exchange URL: selected backend API origin plus `/auth/turnstile`.

Deployment requirements:

- Cloudflare Turnstile hostname management must include `localhost`, `vercel.app`, `swap-dev-5u6.pages.dev` and `swap.cow.fi`.
- CSP `script-src` must allow `https://challenges.cloudflare.com`, otherwise the Turnstile script is blocked before the widget can validate hostnames.

Note: To update CSP allow-lists, edit both `public/_headers` and `vercel.ts`.

Debug helpers:

- `window.useDemoInteractiveCaptchaKey()`
- `window.resetCaptchaKey()`
