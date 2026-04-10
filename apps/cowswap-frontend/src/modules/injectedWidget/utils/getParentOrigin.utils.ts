export function getParentOrigin(): string | undefined {
  if (typeof document !== 'undefined' && document.referrer) {
    try {
      return new URL(document.referrer).origin
    } catch {
      // Ignore invalid referrers and continue to same-origin fallback.
    }
  }

  if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
    try {
      return window.parent.location.origin
    } catch {
      return undefined
    }
  }

  return undefined
}
