import React, { useCallback } from 'react'

import { Command } from '@cowprotocol/types'
import { BackButton, Media, UI } from '@cowprotocol/ui'

import CLOSE_ICON from 'assets/icon/x.svg'
import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

const ModalInner = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: auto;
  margin: auto;
  background: transparent;
  padding: 0;
  position: relative;
`

const Wrapper = styled.div<{
  maxWidth?: number | string
  minHeight?: number | string
  modalMode?: boolean
}>`
  display: flex;
  width: 100%;
  height: 100%;
  margin: auto;
  overflow-y: auto;
  background: ${({ modalMode }) => (modalMode ? `var(${UI.COLOR_PAPER_DARKER})` : `var(${UI.COLOR_PAPER})`)};
  border: ${({ modalMode }) => (modalMode ? `1px solid var(${UI.COLOR_PAPER})` : 'none')};
  border-radius: var(${UI.BORDER_RADIUS_NORMAL});
  box-shadow: var(${UI.BOX_SHADOW});

  ${Media.upToSmall()} {
    margin: 0;
    box-shadow: none;
  }

  ${ModalInner} {
    max-width: ${({ maxWidth }) => (maxWidth ? `${maxWidth}px` : '100%')};
    min-height: ${({ minHeight }) => (minHeight ? `${minHeight}px` : '100%')};

    ${Media.upToSmall()} {
      max-width: 100%;
      height: 100%;
    }
  }
`

const Heading = styled.h2<{ modalMode: boolean }>`
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  width: 100%;
  height: auto;
  margin: 0;
  padding: ${({ modalMode }) => (modalMode ? '16px 20px 3px' : '16px 20px 3px 40px')};
  font-size: var(${UI.FONT_SIZE_MEDIUM});

  ${Media.upToSmall()} {
    position: sticky;
    top: 0;
  }
`

const IconX = styled.div`
  cursor: pointer;
  opacity: 0.7;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;
  margin: 0;

  > svg {
    width: var(${UI.ICON_SIZE_NORMAL});
    height: var(${UI.ICON_SIZE_NORMAL});
    color: var(${UI.ICON_COLOR_NORMAL});
  }

  &:hover {
    opacity: 1;
  }
`

const BackButtonStyled = styled(BackButton)`
  position: absolute;
  top: 14px;
  left: 10px;
`

const NewModalContent = styled.div<{ padding?: string; justifyContent?: string }>`
  display: flex;
  justify-content: ${({ justifyContent }) => justifyContent || 'center'};
  flex-flow: column wrap;
  flex: 1;
  width: 100%;
  height: 100%;
  padding: ${({ padding }) => padding || `0 var(${UI.PADDING_NORMAL}) var(${UI.PADDING_NORMAL})`};

  &.modalMode {
    padding: 10px;
  }

  h1,
  h2,
  h3 {
    width: 100%;
    font-size: var(${UI.FONT_SIZE_MEDIUM});
    font-weight: var(${UI.FONT_WEIGHT_BOLD});
    text-align: left;
    line-height: 1.4;
    margin: 0 auto;
  }

  p {
    font-size: var(${UI.FONT_SIZE_NORMAL});
    font-weight: var(${UI.FONT_WEIGHT_NORMAL});
    color: inherit;
    margin: 0 auto;
    padding: 0;
  }
`

export const NewModalContentTop = styled.div<{ gap?: number; paddingTop?: number }>`
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin: 0 0 auto;
  padding: ${({ paddingTop = 0 }) => `${paddingTop}px`} 0 0;
  gap: ${({ gap = 0 }) => `${gap}px`};

  > span {
    gap: 6px;
    display: flex;
    flex-flow: column wrap;
  }

  p {
    font-size: var(${UI.FONT_SIZE_MEDIUM});
  }
`

export const NewModalContentBottom = styled(NewModalContentTop)`
  margin: auto 0 0;

  p {
    font-size: var(${UI.FONT_SIZE_NORMAL});
  }
`
export interface NewModalProps {
  maxWidth?: number
  minHeight?: number
  contentPadding?: string
  title?: string
  onDismiss?: Command
  children?: React.ReactNode
  modalMode?: boolean
  justifyContent?: string
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function NewModal({
  maxWidth,
  minHeight,
  contentPadding,
  justifyContent,
  modalMode,
  title,
  children,
  onDismiss,
}: NewModalProps) {
  const onDismissCallback = useCallback(() => onDismiss?.(), [onDismiss])

  return (
    <Wrapper maxWidth={maxWidth} minHeight={minHeight} modalMode={modalMode}>
      <ModalInner>
        {!modalMode && <BackButtonStyled onClick={onDismissCallback} />}
        {title && (
          <Heading modalMode={!!modalMode}>
            {title}{' '}
            {modalMode && (
              <IconX onClick={onDismissCallback}>
                <SVG src={CLOSE_ICON} />
              </IconX>
            )}
          </Heading>
        )}

        <NewModalContent
          className={modalMode ? 'modalMode' : ''}
          padding={contentPadding}
          justifyContent={justifyContent}
        >
          {children}
        </NewModalContent>
      </ModalInner>
    </Wrapper>
  )
}
