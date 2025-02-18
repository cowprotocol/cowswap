import React, { useEffect, useRef, useState } from 'react'
import SVG, { Props as SVGProps } from 'react-inlinesvg'
import styled, { keyframes } from 'styled-components/macro'
import { Color } from '@cowprotocol/ui'

interface LazySVGProps extends Omit<SVGProps, 'loader'> {
  src: string
  loader?: React.ReactNode
  rootMargin?: string
}

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`

// Styled component for the loader
const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid transparent;
  border-top: 4px solid ${Color.neutral60};
  margin: 0 auto;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`

const LazySVG: React.FC<LazySVGProps> = ({
  src,
  loader = <Spinner />,
  rootMargin = '100px',
  width,
  height,
  ...props
}) => {
  const [isInView, setIsInView] = useState(false)
  const wrapperRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!wrapperRef.current) {
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
