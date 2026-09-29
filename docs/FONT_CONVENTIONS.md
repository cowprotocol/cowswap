---
author: agents
status: normative
last_reviewed: 2026-08-28
source_of_truth_scope: typography tokens, font mixin usage, and Studio Feixen brand allowlist for CoW Swap + libs/ui
---

# Font Conventions

Applies to new or edited styles in `libs/ui` and `apps/cowswap-frontend`. Explorer and cow-fi use their own rem-based scales; still do not invent 1px-off one-off sizes there.

## Tokens and mixin

- `SHOULD` set size, line-height, and weight with the `font()` mixin from `@cowprotocol/ui` (a styled-components mixin, not a `font:` shorthand):
  ```ts
  import { font } from '@cowprotocol/ui'

  const Title = styled.h3`
    ${font('FONT_LARGE', 'semibold')}
  `
  ```
- `SHOULD NOT` use `Font` from `@cowprotocol/ui` in component styles. `Font.family*` is for theme and `:root` assignment; `Font.weight*` is for deriving CSS variables. In components, pass a weight name to `font()` (`'medium'`, `'semibold'`).
- Default UI type is Inter via `var(${UI.FONT_FAMILY_PRIMARY})` / `font()`. `SHOULD` use `var(${UI.FONT_SIZE_*})` / `var(${UI.FONT_WEIGHT_*})` only when the mixin cannot be used (inline styles, non-styled-components).
- Studio Feixen Sans is a gradual brand-only exception while Marketing rebrands. `MUST NOT` use Feixen outside the allowlist below. `MUST NOT` apply `fontFamilyBrand` in `libs/ui` components, Explorer, or cow-fi product UI. Studio Feixen Mono is removed from CoW Swap ([#8047](https://github.com/cowprotocol/cowswap/pull/8047)); `MUST NOT` reintroduce it.
- Expanding the allowlist requires updating this section in the same PR.

## Studio Feixen Sans allowlist (`fontFamilyBrand`)

Order progress and prominent status headlines:

- `StepComponent.Title` — “Order submitted”, “Solving”, “Best price found!”, “Executing”, etc. (`modules/orderProgressBar/pure/styled.ts` `Title`)
- `TransactionSubmittedContent.Title` — fallback transaction/order status headline (`.../TransactionSubmittedContent/styled.tsx` `Title`)
- `TransactionStatus` — “Transaction completed!”, “Your order expired”, “Your order was cancelled” (`.../steps/styled.ts`)
- `CountdownText` — large circular countdown number in the order-solving progress screen (`.../steps/styled.ts`)
- `BridgingStatusHeader > h3` — “Bridging…”, “Bridging completed!”, “Refund completed!”, etc.

Surplus and post-trade brand moments:

- `SurplusModal` hero message — “Great! You got/saved an extra…” (`SurplusModal.tsx` `h3`)
- `SurplusModal` large primary surplus amount (`SurplusModal.tsx` `strong`)
- `BenefitResponsiveText` — large educational message in the finished-order card
- `SurplusValue` — large surplus percentage in the finished-order card

Promotional and playful brand surfaces:

- `LimitOrdersPromoBanner` main campaign headline only
- `CoWAmmBannerContent.Title`
- `CoWAmmBannerContent.Card` large hero statistic and primary promotional tagline
- `FortuneWidget.FortuneTitle`
- `FortuneWidget.FortuneText`
- `CowSpeechBubbleHiringBanner.TypingLine` — “Mooo, we’re hiring!”

## Size tokens

- `MUST NOT` add a one-off `font-size` (or a new token) that is 1px away from an existing step, especially at 16px and above. Prefer the nearest existing token (for example 19px → `FONT_LARGE` / 18px).
- If a genuine new size is required, add it as a shared token, not a local px value: extend `FONT_SIZING` in `libs/ui/src/consts.ts` (size + line-height pair), the matching `UI.FONT_SIZE_*` enum, and `ThemeColorVars`. Keep the scale small; a one-off size used in a single component is a red flag.
- Do not drive-by-migrate existing `Font.*` or raw `font-size` usages unless the task already touches that style.
