'use client'

/* eslint-disable @next/next/no-img-element */
import { memo, useEffect, useRef } from 'react'
import type { ImgHTMLAttributes, ReactNode } from 'react'

import { LAZY_LOADING_CONFIG, PLACEHOLDER_SRC } from '@/util/lazyLoadImages'

let observer: IntersectionObserver | null = null
const callbacks: Array<(entry: IntersectionObserverEntry) => void> = []

const initObserver = (): void => {
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

const addCallback = (cb: (entry: IntersectionObserverEntry) => void): void => {
  callbacks.push(cb)
  initObserver()
}

const removeCallback = (cb: (entry: IntersectionObserverEntry) => void): void => {
  const index = callbacks.indexOf(cb)
  if (index > -1) {
    callbacks.splice(index, 1)
  }
  if (callbacks.length === 0 && observer) {
    observer.disconnect()
    observer = null
  }
}

function LazyImageBase({
  src,
  alt = '',
  width,
  height,
  style,
  ...props
}: ImgHTMLAttributes<HTMLImageElement>): ReactNode {
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const img = imgRef.current
    if (!img || !src) return undefined

    const handleIntersect = (entry: IntersectionObserverEntry): void => {
      const target = entry.target as HTMLImageElement
      if (entry.isIntersecting && target.dataset.src) {
        target.src = target.dataset.src
        target.style.opacity = '1'
        observer?.unobserve(target)
      }
    }

    addCallback(handleIntersect)
    observer?.observe(img)

    return () => {
      observer?.unobserve(img)
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

export const LazyImage = memo(LazyImageBase)
