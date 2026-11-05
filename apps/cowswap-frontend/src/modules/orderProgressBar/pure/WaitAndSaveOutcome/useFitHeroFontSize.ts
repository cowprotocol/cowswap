import { RefObject, useLayoutEffect, useRef, useState } from 'react'

import { fitHeroFontSize } from './WaitAndSaveOutcome.utils'

export interface FitHeroFontSize {
  ref: RefObject<HTMLParagraphElement | null>
  isFitted: boolean
}

export function useFitHeroFontSize(content: string): FitHeroFontSize {
  const ref = useRef<HTMLParagraphElement>(null)
  const [isFitted, setIsFitted] = useState(false)
  const hasFittedRef = useRef(false)

  useLayoutEffect(() => {
    const element = ref.current

    if (!element) {
      return
    }

    hasFittedRef.current = false
    setIsFitted(false)

    const fit = (): void => {
      if (element.clientWidth <= 0) {
        return
      }

      fitHeroFontSize(element)

      if (!hasFittedRef.current) {
        hasFittedRef.current = true
        setIsFitted(true)
      }
    }

    const parent = element.parentElement
    if (typeof ResizeObserver === 'undefined' || !parent) {
      fit()
      return
    }

    const observer = new ResizeObserver(fit)
    observer.observe(parent)

    return () => {
      observer.disconnect()
    }
  }, [content])

  return { ref, isFitted }
}
