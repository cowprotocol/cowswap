import { ReactNode, useEffect, useRef, useState } from 'react'

import { Media, UI } from '@cowprotocol/ui'

import styled, { keyframes } from 'styled-components/macro'

interface CowSpeechBubbleProps {
  show: boolean
  onClose: () => void
}

const MESSAGE = "Mooo, we're hiring!"
const CAREERS_URL = 'https://cow.fi/careers'
const TYPING_INTERVAL_MS = 140
const BUBBLE_DELAY_MS = 3000

const fadeUp = keyframes`
  0% {
    opacity: 0;
    transform: translateY(22px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`

export function CowSpeechBubble({ show, onClose }: CowSpeechBubbleProps): ReactNode {
  const [charIndex, setCharIndex] = useState(0)
  const [hasDelayElapsed, setHasDelayElapsed] = useState(false)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (!show) {
      setHasDelayElapsed(false)
      setCharIndex(0)
      return
    }

    const delayId = setTimeout(() => {
      if (isMountedRef.current) {
        setHasDelayElapsed(true)
      }
    }, BUBBLE_DELAY_MS)

    return () => {
      clearTimeout(delayId)
      if (isMountedRef.current) {
        setHasDelayElapsed(false)
        setCharIndex(0)
      }
    }
  }, [show])

  useEffect(() => {
    if (!hasDelayElapsed || !show) {
      setCharIndex(0)
      return
    }

    let currentIndex = 0
    const intervalId = setInterval(() => {
      currentIndex = Math.min(currentIndex + 1, MESSAGE.length)
      if (isMountedRef.current) {
        setCharIndex(currentIndex)
      }

      if (currentIndex >= MESSAGE.length) {
        clearInterval(intervalId)
      }
    }, TYPING_INTERVAL_MS)

    return () => clearInterval(intervalId)
  }, [hasDelayElapsed, show])

  const isTypingComplete = charIndex >= MESSAGE.length
  const displayedText = MESSAGE.slice(0, charIndex)
  const showCursor = hasDelayElapsed && show && !isTypingComplete

  if (!show || !hasDelayElapsed) {
    return null
  }

  return (
    <Bubble>
      <CloseButton type="button" aria-label="Dismiss hiring message" onClick={onClose}>
        ×
      </CloseButton>
      <BubbleContent>
        <TypingLine>
          <span>{displayedText}</span>
          <Cursor $visible={showCursor} />
        </TypingLine>
        <JobsLink href={CAREERS_URL} target="_blank" rel="noopener noreferrer" $visible={isTypingComplete}>
          View jobs
          <Arrow aria-hidden="true">→</Arrow>
        </JobsLink>
      </BubbleContent>
    </Bubble>
  )
}

const Bubble = styled.div`
  position: absolute;
  right: 48%;
  top: -55px;
  padding: 16px 20px;
  background: var(${UI.COLOR_PAPER});
  color: var(${UI.COLOR_TEXT});
  border-radius: 18px 6px 18px 18px;
  box-shadow: 0 16px 36px -20px rgba(0, 0, 0, 0.45);
  max-width: 260px;
  text-align: center;
  pointer-events: auto;
  z-index: 2;
  white-space: normal;
  opacity: 0;
  animation: ${fadeUp} 0.45s ease-out forwards;
  will-change: opacity, transform;

  &::after {
    content: '';
    position: absolute;
    right: -22px;
    bottom: 16px;
    border-style: solid;
    border-width: 0 0 22px 22px;
    border-color: transparent transparent transparent var(${UI.COLOR_PAPER});
  }

  ${Media.upToLarge()} {
    right: 49%;
    top: -54px;
    max-width: 220px;

    &::after {
      right: -16px;
      bottom: 14px;
      border-width: 0 0 18px 18px;
    }
  }

  ${Media.upToMedium()} {
    right: 46%;
    top: -60px;
  }

  ${Media.upToSmall()} {
    right: 41%;
    top: -55px;
    padding: 12px 16px;
    max-width: 200px;
  }
`

const BubbleContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  font-weight: 600;
  padding: 10px;

  ${Media.upToSmall()} {
    font-size: 14px;
  }
`

const TypingLine = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 1.4em;
  white-space: pre-wrap;
`

const blink = keyframes`
  0%, 49% {
    opacity: 1;
  }
  50%, 100% {
    opacity: 0;
  }
`

const Cursor = styled.span<{ $visible: boolean }>`
  display: ${({ $visible }) => ($visible ? 'inline-block' : 'none')};
  width: 2px;
  height: 1.2em;
  margin-left: 4px;
  background: currentColor;
  animation: ${blink} 1s steps(1, start) infinite;
`

const JobsLink = styled.a<{ $visible: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: currentColor;
  text-decoration: none;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  pointer-events: ${({ $visible }) => ($visible ? 'auto' : 'none')};
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
  transform: translateY(${({ $visible }) => ($visible ? '0' : '4px')});

  &:hover {
    text-decoration: underline;
  }
`

const Arrow = styled.span`
  font-size: 14px;
  line-height: 1;
`

const CloseButton = styled.button`
  position: absolute;
  top: 2px;
  right: 8px;
  border: none;
  background: none;
  color: var(${UI.COLOR_TEXT_OPACITY_50});
  font-size: 18px;
  padding: 0;
  margin: 0;
  cursor: pointer;
  transition:
    color 0.2s ease,
    transform 0.2s ease;

  &:hover {
    color: var(${UI.COLOR_TEXT});
    transform: scale(1.1);
  }

  &:focus-visible {
    outline: 2px solid var(${UI.COLOR_PAPER_DARKER});
    outline-offset: 2px;
  }
`
