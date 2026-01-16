export type ShareTarget = 'x' | 'linkedin' | 'reddit' | 'telegram' | 'whatsapp' | 'email'

const enc = encodeURIComponent

export function buildShareHref(target: ShareTarget, url: string, title: string): string {
  switch (target) {
    case 'x':
      return `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(title)}`
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`
    case 'reddit':
      return `https://www.reddit.com/submit?url=${enc(url)}&title=${enc(title)}`
    case 'telegram':
      return `https://t.me/share/url?url=${enc(url)}`
    case 'whatsapp':
      return `https://wa.me/?text=${enc(`${title} ${url}`)}`
    case 'email':
      return `mailto:?subject=${enc(title)}&body=${enc(`${title}\n\n${url}`)}`
  }
}

export function openShare(href: string): void {
  const width = 600
  const height = 650
  const left = window.screenX + (window.outerWidth - width) / 2
  const top = window.screenY + (window.outerHeight - height) / 2
  const popup = window.open(
    href,
    'share',
    `popup=yes,width=${width},height=${height},left=${left},top=${top},noopener,noreferrer`,
  )

  if (popup) {
    popup.opener = null
  }
}

export async function copyUrl(url: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(url)
    return
  } catch {}

  const ta = document.createElement('textarea')
  ta.value = url
  ta.style.position = 'fixed'
  ta.style.left = '-9999px'
  document.body.appendChild(ta)
  ta.focus()
  ta.select()
  document.execCommand('copy')
  document.body.removeChild(ta)
}
