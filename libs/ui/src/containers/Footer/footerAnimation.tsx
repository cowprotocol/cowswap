import { useEffect, useRef } from 'react'

import IMG_FLYING_WINK_COW_DARK from '@cowprotocol/assets/images/flying-wink-cow-dark-mode.svg'

import SVG from 'react-inlinesvg'
import styled, { keyframes } from 'styled-components/macro'

import { Color } from '../../colors'

const scrollHorizontal = keyframes`
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
`

const FooterAnimationContainer = styled.div`
  --height: 112px;
  --fontSize: 156px;
  --animationSpeed: 10s;

  display: flex;
  justify-content: flex-start;
  align-items: center;
  position: relative;
  height: var(--height);
  white-space: nowrap;
  color: ${Color.neutral98};
  margin: 50px 0;
  overflow: hidden;
`

const ScrollingContent = styled.div`
  display: flex;
  align-items: center;
  font-size: var(--fontSize);
  gap: 56px;
  white-space: nowrap;
  animation: ${scrollHorizontal} var(--animationSpeed) linear infinite;
  will-change: transform;
  color: inherit;
`

const ScrollingContentWrapper = styled.div`
  height: var(--height);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  white-space: nowrap;
  gap: 56px;
  color: inherit;

  > b {
    display: flex;
    align-items: center;
    justify-content: center;
    height: inherit;
    font-size: 95%;
    font-weight: 700;
    color: inherit;
  }

  > svg {
    height: var(--height);
    width: auto;
    object-fit: contain;
    padding: 0 0 20px;
    border-bottom: 4px solid var(--color);
  }
`

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const FooterAnimation = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current && contentRef.current) {
      const contentWidth = contentRef.current.getBoundingClientRect().width
      const containerWidth = containerRef.current.getBoundingClientRect().width

      // Ensure the content width is at least twice the container width for smooth scrolling
      if (contentWidth < containerWidth * 2) {
        const clone = contentRef.current.cloneNode(true) as HTMLDivElement
        containerRef.current.appendChild(clone)
      }
    }
  }, [])

  return (
    <FooterAnimationContainer ref={containerRef}>
      <ScrollingContent ref={contentRef}>
        <ScrollingContentWrapper>
          <b>MOOOOOOOOOOOOOOOOOO</b>
          <SVG src={IMG_FLYING_WINK_COW_DARK} />
        </ScrollingContentWrapper>
        <ScrollingContentWrapper>
          <b>MOOOOOOOOOOOOOOOOOO</b>
          <SVG src={IMG_FLYING_WINK_COW_DARK} />
        </ScrollingContentWrapper>
      </ScrollingContent>
    </FooterAnimationContainer>
  )
}
