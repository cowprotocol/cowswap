'use client'

import { ReactNode, useEffect, useRef, useState } from 'react'

import styled from 'styled-components/macro'

export type RevealDirection = 'up' | 'left' | 'right'

const HIDDEN_TRANSFORMS: Record<RevealDirection, string> = {
  up: 'translate3d(0, 4rem, 0)',
  left: 'translate3d(-6rem, 0, 0)',
  right: 'translate3d(6rem, 0, 0)',
}

const Wrapper = styled.div<{
  $isVisible: boolean
  $direction: RevealDirection
  $delay: number
  $isFullHeight: boolean
}>`
  width: 100%;
  height: ${({ $isFullHeight }) => ($isFullHeight ? '100%' : 'auto')};
  opacity: ${({ $isVisible }) => ($isVisible ? 1 : 0)};
  transform: ${({ $isVisible, $direction }) => ($isVisible ? 'none' : HIDDEN_TRANSFORMS[$direction])};
  transition:
    opacity 0.7s ease-out,
    transform 0.7s ease-out;
  transition-delay: ${({ $delay }) => $delay}ms;

  @media (prefers-reduced-motion: reduce) {
    opacity: 1;
    transform: none;
    transition: none;
  }
`

interface RevealProps {
  children: ReactNode
  direction?: RevealDirection
  /** Transition delay in milliseconds, used to stagger items in a list */
  delay?: number
  /** Stretches to the parent's height, e.g. to keep grid cards in a row equally tall. Defaults to false */
  isFullHeight?: boolean
}

export function Reveal({ children, direction = 'up', delay = 0, isFullHeight = false }: RevealProps): ReactNode {
  const [isVisible, setIsVisible] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = wrapperRef.current

    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 },
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  return (
    <Wrapper ref={wrapperRef} $isVisible={isVisible} $direction={direction} $delay={delay} $isFullHeight={isFullHeight}>
      {children}
    </Wrapper>
  )
}
