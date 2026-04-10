export function getParentOrigin(): string | undefined {
  return getAncestorOrigin() || getReferrerOrigin() || getParentLocationOrigin()
}

function getAncestorOrigin(): string | undefined {
  if (typeof window === 'undefined') {
    return undefined
  }

  const ancestorOrigins = window.location.ancestorOrigins

  if (!ancestorOrigins || ancestorOrigins.length === 0) {
    return undefined
  }

  return ancestorOrigins[0]
}

function getReferrerOrigin(): string | undefined {
  if (typeof document === 'undefined' || !document.referrer) {
    return undefined
  }

  try {
    return new URL(document.referrer).origin
  } catch {
    return undefined
  }
}

function getParentLocationOrigin(): string | undefined {
  if (typeof window === 'undefined' || !window.parent || window.parent === window) {
    return undefined
  }

  try {
    return window.parent.location.origin
  } catch {
    return undefined
  }
}
