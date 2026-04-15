# captcha

Alpha only.

Current shape:

- `CaptchaWidget.tsx` mounts Turnstile inside swap.
- token lives in `state/turnstileTokenAtom.ts`.
- token is mirrored into `orderBookApi.context.requestHeaders['X-Auth-Token']`.
- widget uses `size: 'flexible'` + `appearance: 'interaction-only'`.
- widget theme follows app theme (`dark` / `light`).
- widget is rendered full-width inside the form.
- root-level captcha mount was removed; swap owns this now.

Testing helpers:

- `window.useDemoInteractiveCaptchaKey()` switches to Cloudflare's demo interactive key.
- `window.resetCaptchaKey()` switches back to `REACT_APP_TURNSTILE_SITE_KEY`.

This is not a clean fallback architecture yet.
It is a staging area for captcha/header wiring and widget behavior experiments.
