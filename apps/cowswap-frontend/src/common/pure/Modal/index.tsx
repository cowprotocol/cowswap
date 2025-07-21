import { useSetAtom } from 'jotai'
import React, { useCallback, useEffect } from 'react'

import { isMobile } from '@cowprotocol/common-utils'
import { Command } from '@cowprotocol/types'
import { Media, UI } from '@cowprotocol/ui'

import { useSpringValue, useTransition } from '@react-spring/web'
import { useGesture } from '@use-gesture/react'
import styled from 'styled-components/macro'

import { ContentWrapper, HeaderRow, HoverText, StyledDialogContent, StyledDialogOverlay } from './styled'

import { openModalState } from '../../state/openModalState'

export * from './styled'
interface ModalProps {
  isOpen: boolean
  onDismiss: Command
  minHeight?: number | false
  maxHeight?: number
  // TODO: Replace any with proper type definitions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialFocusRef?: React.RefObject<any>
  className?: string
  children?: React.ReactNode
}

/**
 * @deprecated use common/pure/NewModal instead
 */
// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function Modal({
  isOpen,
  onDismiss,
  minHeight = false,
  maxHeight = 90,
  initialFocusRef,
  className,
  children,
}: ModalProps) {
  const setOpenModal = useSetAtom(openModalState)
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

  const onDismissCallback = useCallback(() => {
    onDismiss()
    setOpenModal(false)
  }, [onDismiss, setOpenModal])

  useEffect(() => {
    setOpenModal(isOpen)
  }, [isOpen, setOpenModal])

  return (
    <>
      {fadeTransition((props, item) => {
        return (
          item && (
            <StyledDialogOverlay
              className={className}
              style={props}
              onDismiss={onDismissCallback}
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
  border-radius: var(${UI.BORDER_RADIUS_NORMAL});
  color: var(${UI.COLOR_TEXT_PAPER});

  > [data-reach-dialog-content] {
    color: inherit;
    width: 100%;
    max-width: ${({ maxWidth = 500 }) => `${maxWidth}px`};
    border: ${({ border = 'inherit' }) => `${border}`};
    z-index: 100;
    padding: ${({ padding = '0px' }) => `${padding}`};
    margin: auto;
    transition: max-width 0.4s ease;
    background-color: var(${UI.COLOR_PAPER});
    overflow: hidden;
    border-radius: var(${UI.BORDER_RADIUS_NORMAL});

    ${Media.upToSmall()} {
      max-height: 100vh;
      max-width: 100%;
      height: 100%;
      width: 100vw;
      border-radius: 0;
    }

    ${HeaderRow} {
      ${Media.upToSmall()} {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        padding: 16px;
        background: var(${UI.COLOR_PAPER});
        z-index: 20;
      }
    }

    ${HoverText} {
      ${Media.upToSmall()} {
        white-space: nowrap;
      }
    }

    ${ContentWrapper} {
      ${Media.upToSmall()} {
        margin: 82px auto 0;
      }
    }
  }
`
