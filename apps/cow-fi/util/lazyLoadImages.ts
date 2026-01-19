const LAZY_LOADING_CONFIG = {
  rootMargin: '25px',
  placeholderColor: '#f0f0f0',
  fadeInDuration: '0.3s',
  minHeight: '100px',
} as const

const getPlaceholderSrc = (placeholderColor: string): string => {
  const encodedColor = encodeURIComponent(placeholderColor)
  return `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 1 1' preserveAspectRatio='none'><rect width='1' height='1' fill='${encodedColor}' /></svg>`
}

export const PLACEHOLDER_SRC = getPlaceholderSrc(LAZY_LOADING_CONFIG.placeholderColor)

export const replaceImageUrls = (html: string): string => {
  return html.replace(/<img([^>]*)src="([^"]*)"([^>]*)>/g, (_, before, src, after) => {
    return `<img${before}data-src="${src}" src="${PLACEHOLDER_SRC}"${after}>`
  })
}

export { LAZY_LOADING_CONFIG }
