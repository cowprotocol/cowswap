# Captcha

Turnstile is mounted in swap, limit, yield, and twap forms through `containers/CaptchaWidget.container.tsx`.

On success, `api/captchaApi.ts` exchanges the Turnstile token for a JWT, `state/captchaJwtAtom.ts` stores it, and `CaptchaWidget` applies it through `setBearerToken()`.

Exchange URL: selected backend API origin plus `/auth/turnstile`.

Deployment requirements:

- Cloudflare Turnstile hostname management must include `localhost`, `vercel.app`, and `cow.fi`.
- Vercel CSP `script-src` must allow `https://challenges.cloudflare.com`, otherwise the Turnstile script is blocked before the widget can validate hostnames.

Debug helpers:

- `window.useDemoInteractiveCaptchaKey()`
- `window.resetCaptchaKey()`
