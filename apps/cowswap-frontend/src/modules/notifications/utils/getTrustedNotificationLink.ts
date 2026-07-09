export interface TrustedNotificationLink {
  href: string
  target: '_blank' | '_parent'
  rel?: 'noopener noreferrer'
}

function isSingleSlashRelativeUrl(url: string): boolean {
  return url.startsWith('/') && !url.startsWith('//')
}

export function getTrustedNotificationLink(url: string | null | undefined): TrustedNotificationLink | null {
  if (!url) {
    return null
  }

  const trimmedUrl = url.trim()

  if (!trimmedUrl || trimmedUrl.startsWith('//')) {
    return null
  }

  if (isSingleSlashRelativeUrl(trimmedUrl)) {
    return {
      href: trimmedUrl,
      target: '_parent',
    }
  }

  try {
    const parsedUrl = new URL(trimmedUrl)
    const isHttpUrl = parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'

    if (!isHttpUrl) {
      return null
    }

    if (parsedUrl.origin === window.location.origin) {
      return {
        href: parsedUrl.toString(),
        target: '_parent',
      }
    }

    if (parsedUrl.protocol !== 'https:') {
      return null
    }

    return {
      href: parsedUrl.toString(),
      target: '_blank',
      rel: 'noopener noreferrer',
    }
  } catch {
    return null
  }
}
