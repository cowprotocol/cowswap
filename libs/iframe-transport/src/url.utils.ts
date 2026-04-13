// Duplicate from libs/common-utils/src/url.ts

export type HttpsUrlString = `https://${string}`

export type HttpUrlString = `http://${string}`

export type UrlString = HttpsUrlString | HttpUrlString

export function isHttpsUrlString(urlString: string): urlString is HttpsUrlString {
  const url = new URL(urlString)

  return urlString.startsWith('https://') || url.hostname === 'localhost' || url.hostname === '127.0.0.1'
}

export function assertHttpsUrlString(urlString: string): asserts urlString is HttpsUrlString {
  if (!isHttpsUrlString(urlString)) {
    throw new Error('URL is not a valid HTTPS URL')
  }
}

export function getNullableParentOrigin(): UrlString | null {
  return getAncestorOrigin() || getReferrerOrigin() || getParentLocationOrigin() || null
}

export function getParentOriginOrThrow(): UrlString {
  const parentOrigin = getNullableParentOrigin()

  if (!parentOrigin) {
    throw new Error('Parent origin not found')
  }

  return parentOrigin
}

function getAncestorOrigin(): UrlString | undefined {
  if (typeof window === 'undefined') {
    return undefined
  }

  const ancestorOrigins = window.location.ancestorOrigins

  if (!ancestorOrigins || ancestorOrigins.length === 0) {
    return undefined
  }

  return ancestorOrigins[0] as UrlString
}

function getReferrerOrigin(): UrlString | undefined {
  if (typeof document === 'undefined' || !document.referrer) {
    return undefined
  }

  try {
    return new URL(document.referrer).origin as UrlString
  } catch {
    return undefined
  }
}

function getParentLocationOrigin(): UrlString | undefined {
  if (typeof window === 'undefined' || !window.parent || window.parent === window) {
    return undefined
  }

  try {
    return window.parent.location.origin as UrlString
  } catch {
    return undefined
  }
}
