import React, { useEffect, useRef, useState } from 'react'
import SVG, { Props as SVGProps } from 'react-inlinesvg'

interface LazySVGProps extends Omit<SVGProps, 'loader'> {
  src: string
  loader?: React.ReactNode
  rootMargin?: string
}

const LazySVG: React.FC<LazySVGProps> = ({
  src,
  loader = <div>Loading SVG...</div>,
  rootMargin = '100px',
  width,
  height,
  ...props
}) => {
  const [isInView, setIsInView] = useState(false)
  const wrapperRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!wrapperRef.current) {
      console.log('wrapperRef is null')
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        })
      },
      {
        root: null,
        rootMargin: rootMargin,
        threshold: 0,
      },
    )

    observer.observe(wrapperRef.current)

    return () => {
      observer.disconnect()
    }
  }, [rootMargin, src])

  return (
    <span ref={wrapperRef}>
      {isInView ? (
        <SVG
          src={src}
          {...props}
          loader={loader}
          width={typeof width === 'number' ? width : undefined}
          height={typeof height === 'number' ? height : undefined}
        />
      ) : (
        loader
      )}
    </span>
  )
}

export default LazySVG
