/**
 * Resolves the origin of the frame that embeds the current window. Tries three sources,
 * in order:
 *   1. `window.location.ancestorOrigins[0]` — where available (Chromium/Safari)
 *   2. `document.referrer` — original document that opened this frame
 *   3. `window.parent.location.origin` — direct parent access (throws on cross-origin)
 *
 * Returns undefined at top-level (no parent), on opaque `"null"` origins, or when all
 * three lookups fail.
 *
 * Duplicated with `libs/iframe-transport/src/getParentOrigin.ts` on purpose: common-utils
 * sits below iframe-transport in the dep graph and can't import upward.
 */
export function getParentOrigin(): string | undefined {
  const origin =
    normalizeOrigin(getAncestorOrigin()) ||
    normalizeOrigin(getReferrerOrigin()) ||
    normalizeOrigin(getParentLocationOrigin())

  if (!origin) return undefined

  try {
    return new URL(origin).origin
  } catch (e) {
    console.error('[getParentOrigin] origin is invalid', e, { origin })
    return undefined
  }
}

function getAncestorOrigin(): string | undefined {
  if (typeof window === 'undefined') return undefined
  const ancestorOrigins = window.location.ancestorOrigins
  if (!ancestorOrigins || ancestorOrigins.length === 0) return undefined
  return ancestorOrigins[0]
}

function getParentLocationOrigin(): string | undefined {
  if (typeof window === 'undefined' || !window.parent || window.parent === window) return undefined
  try {
    return window.parent.location.origin
  } catch {
    return undefined
  }
}

function getReferrerOrigin(): string | undefined {
  if (typeof document === 'undefined' || !document.referrer) return undefined
  try {
    return new URL(document.referrer).origin
  } catch {
    return undefined
  }
}

function normalizeOrigin(origin: string | undefined): string | undefined {
  return origin && origin !== 'null' ? origin : undefined
}
