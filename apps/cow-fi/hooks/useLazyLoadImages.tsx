import React from 'react'

const LAZY_LOADING_CONFIG = {
  rootMargin: '10px',
  placeholderColor: '#f0f0f0',
  fadeInDuration: '0.3s',
  minHeight: '100px',
}

export function useLazyLoadImages() {
  const replaceImageUrls = React.useCallback((html: string): string => {
    return html.replace(/<img([^>]*)src="([^"]*)"([^>]*)>/g, (match, before, src, after) => {
      return `<img${before}data-src="${src}" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 1 1' preserveAspectRatio='none'%3E%3Crect width='1' height='1' fill='${LAZY_LOADING_CONFIG.placeholderColor.replace('#', '%23')}' /%3E%3C/svg%3E"${after}>`
    })
  }, [])

  const LazyImage = React.useCallback(
    ({ src, alt, width, height, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => {
      const [isLoaded, setIsLoaded] = React.useState(false)
      const imgRef = React.useRef<HTMLImageElement>(null)

      React.useEffect(() => {
        if (!imgRef.current || !src) return

        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && imgRef.current) {
                imgRef.current.src = src
                setIsLoaded(true)
                observer.disconnect()
              }
            })
          },
          { rootMargin: LAZY_LOADING_CONFIG.rootMargin },
        )

        observer.observe(imgRef.current)

        return () => {
          observer.disconnect()
        }
      }, [src])

      if (!src) return null

      return (
        <img
          ref={imgRef}
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 1 1' preserveAspectRatio='none'%3E%3Crect width='1' height='1' fill='${LAZY_LOADING_CONFIG.placeholderColor.replace('#', '%23')}' /%3E%3C/svg%3E"
          data-src={src}
          alt={alt || ''}
          width={width}
          height={height}
          {...props}
          style={{
            ...props.style,
            minHeight: LAZY_LOADING_CONFIG.minHeight,
            opacity: isLoaded ? 1 : 0,
            transition: `opacity ${LAZY_LOADING_CONFIG.fadeInDuration}`,
          }}
        />
      )
    },
    [],
  )

  return { replaceImageUrls, LazyImage }
}
