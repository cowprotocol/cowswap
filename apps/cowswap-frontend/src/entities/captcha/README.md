# Captcha

Turnstile is mounted in swap, limit, yield, and twap forms through `containers/CaptchaWidget.container.tsx`.

On success, `api/captchaApi.ts` exchanges the Turnstile token for a JWT, `state/captchaJwtAtom.ts` stores it, and `CaptchaWidget` mirrors it into `orderBookApi.context.bearerToken`.

Exchange URL: selected backend API origin plus `/auth/turnstile`.

Debug helpers:

- `window.useDemoInteractiveCaptchaKey()`
- `window.resetCaptchaKey()`
