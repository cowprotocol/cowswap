# Captcha

Turnstile is mounted once at app level (`App/Updaters.tsx`) through `containers/CaptchaWidget.container.tsx`. Trade forms (swap, limit, yield, twap) render `CaptchaSlot`, and the widget is portaled into it so the checkbox shows there. On other pages it runs off-screen, so BFF requests get a JWT too.

Errors don't turn the captcha off. Quotes go out without a JWT (`captchaErrorAtom`) while the widget keeps retrying:
- Turnstile retries failed challenges itself.
- Failed JWT exchanges and failed script loads are retried with a backoff of 1s doubling up to 30s (`hooks/useCaptchaRetry.ts`).
- Unsupported browsers aren't retried.

On success, `api/captchaApi.ts` exchanges the Turnstile token for a JWT, `entities/captcha/state/captchaJwtAtom.ts` stores it, and `CaptchaWidget` applies it through `setBearerToken()` to order book requests and to BFF requests made with `bffFetch` (`@cowprotocol/common-utils`). BFF requests without a JWT are still sent.

Exchange URL: selected backend API origin plus `/auth/turnstile`.

Feature flag: `isCaptchaEnabled`. Missing or false disables the widget and prevents token exchange; `false` also clears any stored captcha JWT from order book and BFF requests.

Deployment requirements:

- Cloudflare Turnstile hostname management must include `localhost`, `vercel.app` and `swap.cow.fi`.
- CSP `script-src` must allow `https://challenges.cloudflare.com`, otherwise the Turnstile script is blocked before the widget can validate hostnames.

Note: To update CSP allow-lists, edit `vercel.ts`.

Debug helpers:

- `window.useDemoInteractiveCaptchaKey()`
- `window.resetCaptchaKey()`
