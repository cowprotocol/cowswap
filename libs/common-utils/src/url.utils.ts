// Duplicate from libs/iframe-transport/src/url.utils.ts

export type HttpsUrlString = `https://${string}`

export type HttpUrlString = `http://${string}`

export type UrlString = HttpsUrlString | HttpUrlString

export function assertHttpsUrlString(urlString: string): asserts urlString is HttpsUrlString {
  if (!isHttpsUrlString(urlString)) {
    throw new Error('URL is not a valid HTTPS URL')
  }
}

export function getNullableParentOrigin(): UrlString | null {
  const origin =
    normalizeOrigin(getAncestorOrigin()) ||
    normalizeOrigin(getReferrerOrigin()) ||
    normalizeOrigin(getParentLocationOrigin())

  if (!origin) return null

  try {
    return new URL(origin).origin as UrlString
  } catch (e) {
    console.error('[getNullableParentOrigin] origin is invalid', e, { origin })
    return null
  }
}

export function getParentOriginOrThrow(): UrlString {
  const parentOrigin = getNullableParentOrigin()

  if (!parentOrigin) {
    throw new Error('Parent origin not found')
  }

  return parentOrigin
}

export function isHttpsUrlString(urlString: string): urlString is HttpsUrlString {
  const url = new URL(urlString)

  return urlString.startsWith('https://') || isLocalDevHostname(url.hostname)
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

function isLocalDevHostname(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '::1' ||
    hostname === '[::1]' ||
    hostname.endsWith('.localhost')
  )
}

function normalizeOrigin(origin: string | undefined): string | undefined {
  return origin && origin !== 'null' ? origin : undefined
}
