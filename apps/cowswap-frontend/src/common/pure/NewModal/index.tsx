import React from 'react'

import { UI } from '@cowprotocol/ui'

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

const Wrapper = styled.div<{ maxWidth?: number | string; minHeight?: number | string }>`
  display: flex;
  width: 100%;
  height: 100%;
  margin: auto;
  overflow-y: auto;
  background: var(${UI.COLOR_PAPER});
  border-radius: var(${UI.BORDER_RADIUS_NORMAL});
  box-shadow: var(${UI.BOX_SHADOW});

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 0;
    border-radius: 0;
    border-top-left-radius: var(${UI.BORDER_RADIUS_NORMAL});
    border-top-right-radius: var(${UI.BORDER_RADIUS_NORMAL});
    box-shadow: none;
  `}

  ${ModalInner} {
    max-width: ${({ maxWidth }) => (maxWidth ? `${maxWidth}px` : '100%')};
    min-height: ${({ minHeight }) => (minHeight ? `${minHeight}px` : '100%')};

    ${({ theme }) => theme.mediaWidth.upToSmall`
      max-width: 100%;
      height: 100%;
    `}
  }
`

const Heading = styled.h2`
  display: flex;
  justify-content: space-between;
  width: 100%;
  height: auto;
  padding: 18px;
  margin: 0;
  font-size: var(${UI.FONT_SIZE_MEDIUM});

  ${({ theme }) => theme.mediaWidth.upToSmall`
    position: sticky;
    top: 0;
  `}
`

const IconX = styled.div`
  position: absolute;
  top: 16px;
  right: 10px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;
  margin: 0 0 0 auto;

  > svg {
    width: var(${UI.ICON_SIZE_NORMAL});
    height: var(${UI.ICON_SIZE_NORMAL});
    color: var(${UI.ICON_COLOR_NORMAL});
  }

  &:hover {
    opacity: 1;
  }
`

const NewModalContent = styled.div<{ paddingTop?: number }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-flow: column wrap;
  flex: 1;
  width: 100%;
  height: 100%;
  padding: 0 var(${UI.PADDING_NORMAL}) var(${UI.PADDING_NORMAL});

  h1,
  h2,
  h3 {
    width: 100%;
    font-size: var(${UI.FONT_SIZE_LARGER});
    font-weight: var(${UI.FONT_WEIGHT_BOLD});
    text-align: center;
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
  title?: string
  onDismiss?: () => void
  children?: React.ReactNode
}

export function NewModal({ maxWidth = 450, minHeight = 450, title, children, onDismiss }: NewModalProps) {
  return (
    <Wrapper maxWidth={maxWidth} minHeight={minHeight}>
      <ModalInner>
        {title && <Heading>{title}</Heading>}
        <IconX onClick={() => onDismiss && onDismiss()}>
          <SVG src={CLOSE_ICON} />
        </IconX>

        <NewModalContent>{children}</NewModalContent>
      </ModalInner>
    </Wrapper>
  )
}
