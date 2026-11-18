---
author: agents
status: normative
last_reviewed: 2026-11-13
source_of_truth_scope: how to turn the graffiti wall off, and how to delete it
---

# Graffiti Wall — turning it off and taking it out

The graffiti wall is a launch campaign, not a product surface. It is built to be deleted.
This file is the checklist for both ways of doing that.

See also [`SPEC.md`](./SPEC.md) (what it does) and [`OPERATIONS.md`](./OPERATIONS.md) (running the backend).

## 1. Turning it off — no code change

Set the LaunchDarkly flag **`isGraffitiWallEnabled`** to `false`. That is the master switch:
it hides the route, the `More` menu entry, the cow speech bubble and the app-wide theme.

`isSolanaThemeEnabled` is a second, narrower dial: turning only that one off leaves the wall
page and its menu entry in place but stops the theme repainting the app on Solana.

Nothing is persisted that outlives the flag. The one piece of user state, the
`graffitiThemeEnabled:v0` opt-out in localStorage, is read only while the feature is on.

## 2. Taking it out — the full checklist

Everything the feature owns lives in four directories. Delete them:

| Path | What it is |
| --- | --- |
| `apps/cowswap-frontend/src/pages/graffiti/` | the wall page and the claim screen |
| `apps/cowswap-frontend/src/modules/graffitiWall/` | the theme, its CSS, the flag hook, the API config |
| `apps/graffiti-api/` | the backend |
| `docs/graffiti/` | this directory |

Then these single-purpose files:

- `apps/cowswap-frontend/src/modules/application/containers/AppContainer/CowSpeechBubble/CowSpeechBubbleGraffitiWallBanner.tsx`
- `apps/cowswap-frontend/src/modules/application/hooks/useAppTheme.ts` — its callers go back to `useCustomTheme`
- `.github/workflows/docker-graffiti-api.yml` and `.dockerignore`
- `apps/cowswap-frontend/public/token/grass.json`, `apps/cowswap-frontend/public/token/grass.png`
- `libs/assets/src/cow-swap/graffiti-cows.png`, `libs/assets/src/cow-swap/grass-token.png`

Then revert these call sites. Each is a few lines, and every one of them greps for `graffiti`
or `darkGraffiti`:

| File | What to take out |
| --- | --- |
| `common/constants/routes.ts` | `GRAFFITI`, `GRAFFITI_CLAIM` |
| `common/constants/banners.ts` | `GRAFFITI_WALL_SPEECH_BUBBLE` |
| `modules/application/containers/App/RoutesApp.tsx` | the lazy import, `graffitiRoutes`, the flag check |
| `modules/application/containers/App/menuConsts.tsx` | the `More` entry and `NavItemsFlags.isGraffitiWallEnabled` |
| `modules/application/containers/App/styled.ts` | the `modules/graffitiWall` import and its four interpolations; `FooterSlot`'s `customTheme` prop |
| `modules/application/containers/App/styled.test.tsx` | the `AppWrapper under the graffiti theme` block |
| `modules/application/containers/AppContainer/AppContainer.container.tsx` | the bubble branch, `FooterSlot customTheme`, `useAppTheme` → `useCustomTheme` |
| `modules/application/containers/AppContainer/CowSpeechBubble/CowSpeechBubble.types.ts` | the `'graffiti'` variant |
| `modules/application/containers/AppContainer/CowSpeechBubble/CowSpeechBubble.styled.tsx` | `WallLink`, `Subtitle`, and the `revealedLink` split |
| `modules/application/containers/AppMenu/index.tsx` | the blur, the settings entry, the nav flag |
| `libs/ui/src/types.ts` | `'darkGraffiti'` |
| `libs/common-hooks/src/useFeatureFlags.ts` | `isGraffitiWallEnabled`, `isSolanaThemeEnabled` |
| `apps/cowswap-frontend/package.json` | `perfect-freehand` |
| `package.json` | `better-sqlite3` under `allowBuilds` |
| `bundle-size.jsonc` | drop the cowswap budget back |
| `.env.local.example` | the Graffiti Wall block |

Finally, archive the LaunchDarkly flags and the `graffiti-api` container image and deployment.

## 3. What can stay

These shipped with the wall but are not about it, and reverting them buys nothing:

- `libs/ui/src/containers/Footer/` — `--bgCollapsed` / `--bgExpanded` / `--footerLogoColor` hooks
- `libs/ui/src/pure/MenuBar/` — the `blur` prop
- `libs/ui/src/pure/ProductLogo/index.tsx` — a theme without its own logo now falls back within its own brightness family
- `modules/application/contexts/PageBackgroundContext.tsx` — the `fullBleed` page layout and `useFullBleedPage`
- `libs/common-const/src/featureFlags.ts`, `libs/common-hooks/src/useFeatureFlags.ts` — `REACT_APP_FEATURE_FLAGS` / `REACT_APP_BOOT_FEATURE_FLAGS` overrides for local dev
- `libs/wallet/**` — Solana devnet support, the AppKit modal DOM-event fix, and network switching from a Solana-only session
- `apps/cowswap-frontend/vite.config.mts` — `NO_SOURCEMAP`

## 4. Keeping the footprint honest

`modules/graffitiWall/graffitiWall.containment.test.ts` holds the list of files outside the
feature's own directories that are allowed to mention it, and fails when a new one appears.
When a change genuinely has to touch shared code, add the file to that list and to the table
above in the same PR. The list is the removal cost; a review that lets it grow silently is
how a temporary feature stops being removable.
