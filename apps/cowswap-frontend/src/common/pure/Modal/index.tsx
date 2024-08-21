import { useAtomValue, useSetAtom } from 'jotai'
import React, { useCallback, useEffect } from 'react'

import { isMobile } from '@cowprotocol/common-utils'
import { Command } from '@cowprotocol/types'
import { Media, UI } from '@cowprotocol/ui'

import { useSpringValue, useTransition } from '@react-spring/web'
import { useGesture } from '@use-gesture/react'
import styled from 'styled-components/macro'

import { ContentWrapper, HeaderRow, HoverText, StyledDialogContent, StyledDialogOverlay } from './styled'

import { closeModalAtom, getModalStateAtom, openModalAtom } from '../../state/openModalState'

export * from './styled'

interface ModalProps {
  isOpen: boolean
  onDismiss: Command
  minHeight?: number | false
  maxHeight?: number
  initialFocusRef?: React.RefObject<any>
  className?: string
  children?: React.ReactNode
  id: string
  maxWidth?: number | string
  backgroundColor?: string
  border?: string
  padding?: string
}

/**
 * @deprecated use common/pure/NewModal instead
 */
export function Modal({
  isOpen,
  onDismiss,
  minHeight = false,
  maxHeight = 90,
  initialFocusRef,
  className,
  children,
  id,
  maxWidth,
  backgroundColor,
  border,
  padding,
}: ModalProps) {
  const openModal = useSetAtom(openModalAtom)
  const closeModal = useSetAtom(closeModalAtom)
  const getModalState = useAtomValue(getModalStateAtom)

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
    closeModal(id)
  }, [onDismiss, closeModal, id])

  useEffect(() => {
    if (isOpen) {
      openModal(id)
    }
  }, [isOpen, openModal, id])

  const { zIndex } = getModalState(id)

  return (
    <>
      {fadeTransition((props, item) => {
        return (
          item && (
            <StyledDialogOverlay
              className={className}
              style={{
                ...props,
                zIndex,
                maxWidth,
                backgroundColor,
                border,
                padding,
              }}
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
                $maxWidth={maxWidth}
                $backgroundColor={backgroundColor}
                $border={border}
                $padding={padding}
              >
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

export const CowModal = styled(Modal).attrs<ModalProps>((props) => ({
  id: props.id || `modal-${Math.random().toString(36).substr(2, 9)}`,
}))`
  border-radius: var(${UI.BORDER_RADIUS_NORMAL});
  color: var(${UI.COLOR_TEXT_PAPER});

  > [data-reach-dialog-content] {
    color: inherit;
    width: 100%;
    margin: auto;
    transition: max-width 0.4s ease;
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
