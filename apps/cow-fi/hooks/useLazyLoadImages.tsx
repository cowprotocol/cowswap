import React, { useEffect, useRef, useCallback, FC, ImgHTMLAttributes, memo } from 'react'

let observer: IntersectionObserver | null = null
const callbacks: ((entry: IntersectionObserverEntry) => void)[] = []

const LAZY_LOADING_CONFIG = {
  rootMargin: '25px',
  placeholderColor: '#f0f0f0',
  fadeInDuration: '0.3s',
  minHeight: '100px',
}

// Utility function to generate placeholder src
const getPlaceholderSrc = (placeholderColor: string): string => {
  const encodedColor = encodeURIComponent(placeholderColor)
  return `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='0 0 1 1' preserveAspectRatio='none'><rect width='1' height='1' fill='${encodedColor}' /></svg>`
}

const PLACEHOLDER_SRC = getPlaceholderSrc(LAZY_LOADING_CONFIG.placeholderColor)

const initObserver = () => {
  if (observer) return

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        callbacks.forEach((cb) => cb(entry))
      })
    },
    { rootMargin: LAZY_LOADING_CONFIG.rootMargin },
  )
}

const addCallback = (cb: (entry: IntersectionObserverEntry) => void) => {
  callbacks.push(cb)
  initObserver()
}

const removeCallback = (cb: (entry: IntersectionObserverEntry) => void) => {
  const index = callbacks.indexOf(cb)
  if (index > -1) {
    callbacks.splice(index, 1)
  }
  // If no callbacks remain, disconnect the observer
  if (callbacks.length === 0 && observer) {
    observer.disconnect()
    observer = null
  }
}

export function useLazyLoadImages() {
  const replaceImageUrls = useCallback((html: string): string => {
    return html.replace(/<img([^>]*)src="([^"]*)"([^>]*)>/g, (_, before, src, after) => {
      return `<img${before}data-src="${src}" src="${PLACEHOLDER_SRC}"${after}>`
    })
  }, [])

  const LazyImage: FC<ImgHTMLAttributes<HTMLImageElement>> = ({ src, alt = '', width, height, style, ...props }) => {
    const imgRef = useRef<HTMLImageElement>(null)

    useEffect(() => {
      if (!imgRef.current || !src) return

      const handleIntersect = (entry: IntersectionObserverEntry) => {
        const img = entry.target as HTMLImageElement
        if (entry.isIntersecting && img.dataset.src) {
          img.src = img.dataset.src
          img.style.opacity = '1'
          observer?.unobserve(img)
        }
      }

      addCallback(handleIntersect)

      observer?.observe(imgRef.current)

      return () => {
        if (imgRef.current) {
          observer?.unobserve(imgRef.current)
        }

        removeCallback(handleIntersect)
      }
    }, [src])

    return (
      <img
        ref={imgRef}
        src={PLACEHOLDER_SRC}
        data-src={src}
        alt={alt}
        width={width}
        height={height}
        {...props}
        style={{
          minHeight: LAZY_LOADING_CONFIG.minHeight,
          opacity: 0,
          transition: `opacity ${LAZY_LOADING_CONFIG.fadeInDuration}`,
          ...style,
        }}
      />
    )
  }

  const MemoizedLazyImage = memo(LazyImage)

  return { replaceImageUrls, LazyImage: MemoizedLazyImage }
}
