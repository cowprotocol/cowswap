import React from 'react'

import { useSpringValue, useTransition } from '@react-spring/web'
import { useGesture } from '@use-gesture/react'
import CLOSE_ICON from 'assets/icon/x.svg'
import SVG from 'react-inlinesvg'
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
                $minHeight={minHeight}
                $maxHeight={maxHeight}
                $mobile={isMobile}
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

export const CowModal = styled(Modal) <{
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
        margin: 82px auto 0;
      `}
    }
  }
`

// New Modal to be used going forward =================================
const ModalInner = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: auto;
  margin: auto;
  background: var(--cow-container-bg-01);
  border-radius: var(--cow-border-radius-normal);
  box-shadow: var(--cow-box-shadow-normal);
  padding: 0;
`

const NewCowModal = styled.div<{ maxWidth?: number | string; minHeight?: number | string }>`
  display: flex;
  width: 100%;
  height: 100%;
  margin: auto;
  background: var(--cow-modal-backdrop);
  overflow-y: auto;

  ${ModalInner} {
    max-width: ${({ maxWidth }) => maxWidth ? `${maxWidth}px` : '100%'};
    min-height: ${({ minHeight }) => minHeight ? `${minHeight}px` : '100%'};
  }
`

const Heading = styled.h2`
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: auto;
  padding: 18px;
  margin: 0;
  font-size: var(--cow-font-size-normal);
`

const IconX = styled.div`
  position: fixed;
  top: 18px;
  right: 18px;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s ease-in-out;
  margin: 0 0 0 auto;

  > svg {
    width: var(--cow-icon-size-normal);
    height: var(--cow-icon-size-normal);
    fill: var(--cow-icon-color-normal);
  }

  &:hover {
    opacity: 1;
  }
`

const NewModalContent = styled.div<{ paddingTop?: number}>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-flow: column wrap;
  flex: 1;
  width: 100%;
  height: 100%;
  padding: 0 var(--cow-padding-normal) var(--cow-padding-normal);

  h1, 
  h2, 
  h3 {
    width: 100%;
    font-size: var(--cow-font-size-larger);
    font-weight: var(--cow-font-weight-bold);
    text-align: center;
    line-height: 1.4;
    margin: 0 auto;
  }

  p {
    font-size: var(--cow-font-size-normal);
    font-weight: var(--cow-font-weight-normal);
    color: var(--cow-color-text2);
    margin: 0 auto;
    padding: 0;
  }
`

export const NewModalContentTop = styled.div<{ paddingTop?: number }>`
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin: 0 0 auto;
  padding: ${({ paddingTop = 0 }) => `${paddingTop}px`} 0 0;
  gap: 24px;

  > span {
    gap: 6px;
    display: flex;
    flex-flow: column wrap;
  }

  p {
    font-size: var(--cow-font-size-medium);
  }
`

export const NewModalContentBottom = styled(NewModalContentTop)`
  margin: auto 0 0;

  p {
    font-size: var(--cow-font-size-normal);
  }
`
interface NewModalProps {
  maxWidth?: number
  minHeight?: number
  title?: string
  children?: React.ReactNode
}

export function NewModal({
  maxWidth = 450,
  minHeight = 475,
  title,
  children,
}: NewModalProps) {

  return (
    <NewCowModal maxWidth={maxWidth} minHeight={minHeight}>

      <ModalInner>
        {title && <Heading>{title}</Heading>}
        <NewModalContent>
          {children}
        </NewModalContent>
      </ModalInner>

      <IconX><SVG src={CLOSE_ICON} onClick={() => console.log("Close Modal")} /></IconX>

    </NewCowModal>
  )
}
