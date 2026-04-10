function logIframeOriginResolution(message: string, details: Record<string, unknown>): void {
  console.debug('[COW][Widget][Iframe]', message, details)
}

export function getParentOrigin(): string | undefined {
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : undefined
  const referrer = typeof document !== 'undefined' ? document.referrer || null : null
  const originDetails = { currentOrigin, referrer }
  const ancestorOrigin = getAncestorOrigin(originDetails)

  if (ancestorOrigin) {
    return ancestorOrigin
  }

  const referrerOrigin = getReferrerOrigin(originDetails)

  if (referrerOrigin) return referrerOrigin

  const parentLocationOrigin = getParentLocationOrigin(originDetails)

  if (parentLocationOrigin) return parentLocationOrigin

  logIframeOriginResolution('Parent origin unavailable', originDetails)

  return undefined
}

function getAncestorOrigin(originDetails: Record<string, unknown>): string | undefined {
  if (typeof window === 'undefined') {
    return undefined
  }

  const ancestorOrigins = window.location.ancestorOrigins

  if (!ancestorOrigins || ancestorOrigins.length === 0) {
    return undefined
  }

  const ancestorOrigin = ancestorOrigins[0]
  logIframeOriginResolution('Resolved parent origin from ancestorOrigins', { ancestorOrigin, ...originDetails })

  return ancestorOrigin
}

function getReferrerOrigin(originDetails: Record<string, unknown>): string | undefined {
  if (typeof document === 'undefined' || !document.referrer) {
    return undefined
  }

  try {
    const referrerOrigin = new URL(document.referrer).origin
    logIframeOriginResolution('Resolved parent origin from document.referrer', { referrerOrigin, ...originDetails })

    return referrerOrigin
  } catch {
    return undefined
  }
}

function getParentLocationOrigin(originDetails: Record<string, unknown>): string | undefined {
  if (typeof window === 'undefined' || !window.parent || window.parent === window) {
    return undefined
  }

  try {
    const parentOrigin = window.parent.location.origin
    logIframeOriginResolution('Resolved parent origin from window.parent.location.origin', {
      parentOrigin,
      ...originDetails,
    })

    return parentOrigin
  } catch {
    logIframeOriginResolution('Unable to read parent origin from window.parent.location.origin', originDetails)

    return undefined
  }
}
