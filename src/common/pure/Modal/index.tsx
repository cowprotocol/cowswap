import React from 'react'

import { DialogContent, DialogOverlay } from '@reach/dialog'
import { animated, useSpringValue, useTransition } from '@react-spring/web'
import { useGesture } from '@use-gesture/react'
import { transparentize } from 'polished'
import styled, { css } from 'styled-components/macro'

import { isMobile } from 'legacy/utils/userAgent'

export const HeaderRow = styled.div`
  ${({ theme }) => theme.flexRowNoWrap};
  padding: 1rem 1rem;
  font-weight: 500;
  color: ${(props) => (props.color === 'blue' ? ({ theme }) => theme.primary1 : 'inherit')};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    padding: 1rem;
  `};
`

export const CloseIcon = styled.div`
  position: absolute;
  right: 1rem;
  top: 14px;
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
`

export const HoverText = styled.div`
  text-decoration: none;
  color: ${({ theme }) => theme.text1};
  display: flex;
  align-items: center;

  :hover {
    cursor: pointer;
  }
`

export const ContentWrapper = styled.div`
  /* background-color: ${({ theme }) => theme.bg0}; */
  background-color: ${({ theme }) => theme.bg1};
  padding: 0 1rem 1rem 1rem;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  ${({ theme }) => theme.mediaWidth.upToMedium`padding: 0 1rem 1rem 1rem`};
`

export const GpModal = styled(Modal)<{
  maxWidth?: number | string
  backgroundColor?: string
  border?: string
  padding?: string
}>`
  > [data-reach-dialog-content] {
    color: ${({ theme }) => theme.text1};
    width: 100%;
    max-width: ${({ maxWidth = 470 }) => `${maxWidth}px`};
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

const AnimatedDialogOverlay = animated(DialogOverlay)
const StyledDialogOverlay = styled(AnimatedDialogOverlay)`
  &[data-reach-dialog-overlay] {
    z-index: 2;
    background-color: transparent;
    overflow: hidden;

    display: flex;
    align-items: center;
    justify-content: center;

    background-color: ${({ theme }) => theme.modalBG};
  }
`

const AnimatedDialogContent = animated(DialogContent)
// destructure to not pass custom props to Dialog DOM element
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const StyledDialogContent = styled(({ ...rest }) => <AnimatedDialogContent {...rest} />).attrs({
  'aria-label': 'dialog',
})`
  overflow-y: auto;

  &[data-reach-dialog-content] {
    margin: 0 0 2rem 0;
    background-color: ${({ theme }) => theme.bg0};
    border: 1px solid ${({ theme }) => theme.bg1};
    box-shadow: 0 4px 8px 0 ${({ theme }) => transparentize(0.95, theme.shadow1)};
    padding: 0px;
    width: 50vw;
    overflow-y: auto;
    overflow-x: hidden;

    align-self: ${({ mobile }) => (mobile ? 'flex-end' : 'center')};

    max-width: 420px;
    ${({ maxHeight }) =>
      maxHeight &&
      css`
        max-height: ${maxHeight}vh;
      `}
    ${({ minHeight }) =>
      minHeight &&
      css`
        min-height: ${minHeight}vh;
      `}
    display: flex;
    border-radius: 20px;
    ${({ theme }) => theme.mediaWidth.upToMedium`
      width: 65vw;
      margin: 0;
    `}
    ${({ theme, mobile }) => theme.mediaWidth.upToSmall`
      width:  85vw;
      ${
        mobile &&
        css`
          width: 100vw;
          border-radius: 20px;
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
        `
      }
    `}
  }
`

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
