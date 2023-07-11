import React from 'react'

import { useSpringValue, useTransition } from '@react-spring/web'
import { useGesture } from '@use-gesture/react'
import styled from 'styled-components/macro'

import { isMobile } from 'legacy/utils/userAgent'

import { CloseIcon, ContentWrapper, HeaderRow, HoverText, StyledDialogContent, StyledDialogOverlay } from './styled'

export * from './styled'

interface ModalProps {
  isOpen: boolean
  onDismiss: () => void
  minHeight?: number | false
  maxHeight?: number
  initialFocusRef?: React.RefObject<any>
  className?: string
  children?: React.ReactNode
}

export function Modal({
  isOpen,
  onDismiss,
  minHeight = false,
  maxHeight = 90,
  initialFocusRef,
  className,
  children,
}: ModalProps) {
  const fadeTransition = useTransition(isOpen, {
    config: { duration: 200 },
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
  })

  const y = useSpringValue(0, { config: { mass: 1, tension: 210, friction: 20 } })
  const bind = useGesture({
    onDrag: (state) => {
      y.set(state.down ? state.movement[1] : 0)
      if (state.movement[1] > 300 || (state.velocity[1] > 3 && state.direction[1] > 0)) {
        onDismiss()
      }
    },
  })

  return (
    <>
      {fadeTransition((props, item) => {
        return (
          item && (
            <StyledDialogOverlay
              className={className}
              style={props}
              onDismiss={onDismiss}
              initialFocusRef={initialFocusRef}
              dangerouslyBypassFocusLock={true}
            >
              <StyledDialogContent
                {...(isMobile
                  ? {
                      ...bind(),
                      style: { transform: y.interpolate((y) => `translateY(${(y as number) > 0 ? y : 0}px)`) },
                    }
                  : {})}
                aria-label="dialog content"
                minHeight={minHeight}
                maxHeight={maxHeight}
                mobile={isMobile}
              >
                {/* prevents the automatic focusing of inputs on mobile by the reach dialog */}
                {/* eslint-disable-next-line jsx-a11y/tabindex-no-positive, jsx-a11y/no-noninteractive-tabindex */}
                {!initialFocusRef && isMobile ? <div tabIndex={1} /> : null}
                {children}
              </StyledDialogContent>
            </StyledDialogOverlay>
          )
        )
      })}
    </>
  )
}

export const CowModal = styled(Modal)<{
  maxWidth?: number | string
  backgroundColor?: string
  border?: string
  padding?: string
}>`
  > [data-reach-dialog-content] {
    color: ${({ theme }) => theme.text1};
    width: 100%;
    max-width: ${({ maxWidth = 500 }) => `${maxWidth}px`};
    border: ${({ border = 'inherit' }) => `${border}`};
    z-index: 100;
    padding: ${({ padding = '0px' }) => `${padding}`};
    margin: auto;
    transition: max-width 0.4s ease;
    background-color: ${({ theme }) => theme.bg1};
    overflow: hidden;

    ${({ theme }) => theme.mediaWidth.upToSmall`
      max-height: 100vh;
      max-width: 100%;
      height: 100%;
      width: 100vw;
      border-radius: 0;
    `}

    ${HeaderRow} {
      ${({ theme }) => theme.mediaWidth.upToSmall`
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        padding: 16px;
        background: ${({ theme }) => theme.bg1};
        z-index: 20;
      `}
    }

    ${CloseIcon} {
      ${({ theme }) => theme.mediaWidth.upToSmall`
        z-index: 21;
        position: fixed;
      `}
    }

    ${HoverText} {
      ${({ theme }) => theme.mediaWidth.upToSmall`
        white-space: nowrap;
      `}
    }

    ${ContentWrapper} {
      ${({ theme }) => theme.mediaWidth.upToSmall`
        margin: 62px auto 0;
      `}
    }
  }
`
