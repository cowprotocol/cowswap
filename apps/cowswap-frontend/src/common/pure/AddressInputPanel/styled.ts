import { UI } from '@cowprotocol/ui'

import styled, { keyframes } from 'styled-components/macro'

export const ReceiverPanel = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  background-color: var(${UI.COLOR_PAPER_DARKER});
  width: 100%;
`

export const ReceiverHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
`

export const ChainLabelGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

export const ChainIconImg = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 50%;
`

export const ChainNameLabel = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: var(${UI.COLOR_TEXT});
`

export const ReceiverActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

export const ActionBtn = styled.button`
  background: none;
  border: none;
  padding: 0;
  font-size: 13px;
  font-weight: 400;
  color: var(${UI.COLOR_TEXT_OPACITY_50});
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    color: var(${UI.COLOR_TEXT});
  }
`

export const ActionExternalLink = styled.a`
  background: none;
  border: none;
  padding: 0;
  font-size: 13px;
  font-weight: 400;
  color: var(${UI.COLOR_TEXT_OPACITY_50});
  cursor: pointer;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    color: var(${UI.COLOR_TEXT});
  }
`

export const QrIconWrapper = styled.span`
  display: inline-flex;
  align-items: center;
`

export const ReceiverInputWrapper = styled.div`
  padding: 0 16px 12px;
`

export const ReceiverInputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

export const ValidCheckmark = styled.span`
  display: flex;
  align-items: center;
  color: var(${UI.COLOR_SUCCESS});
  flex-shrink: 0;
`

export const ReceiverInput = styled.input<{ $error?: boolean }>`
  font-size: var(${UI.FONT_SIZE_LARGER});
  font-family: var(${UI.FONT_FAMILY_MONO});
  letter-spacing: -0.2px;
  outline: none;
  border: none;
  flex: 1 1 auto;
  background: none;
  transition: color 0.2s step-start;
  color: ${({ $error }) => ($error ? `var(${UI.COLOR_DANGER})` : 'inherit')};
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
  width: 100%;
  padding: 0;
  appearance: textfield;
  -webkit-appearance: textfield;

  &&::placeholder {
    color: inherit;
    opacity: 0.5;
  }

  &:focus::placeholder {
    color: transparent;
  }

  ::-webkit-search-decoration {
    -webkit-appearance: none;
  }

  ::-webkit-outer-spin-button,
  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
  }
`

export const ReceiverErrorText = styled.p`
  font-size: 13px;
  color: var(${UI.COLOR_DANGER});
  padding-top: 8px;
  margin: 0;
`

export const ConfirmationRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(${UI.COLOR_PAPER_DARKEST});
  border-radius: 0 0 16px 16px;
  padding: 12px 16px;

  input[type='checkbox'] {
    accent-color: var(${UI.COLOR_SUCCESS});
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    cursor: pointer;
  }
`

export const ConfirmationLabel = styled.label<{ $confirmed: boolean }>`
  font-size: 13px;
  color: ${({ $confirmed }) => ($confirmed ? `var(${UI.COLOR_SUCCESS})` : `var(${UI.COLOR_TEXT_OPACITY_50})`)};
  cursor: pointer;
  user-select: none;
`

// QR Modal

export const QrModalWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
`

export const VideoContainer = styled.div`
  position: relative;
  width: 100%;
`

export const CameraVideo = styled.video`
  width: 100%;
  border-radius: 12px;
  display: block;
`

export const CornerBracketOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  border-radius: 12px;
  overflow: hidden;

  > span {
    position: absolute;
    width: 24px;
    height: 24px;
    border: 3px solid white;
  }

  > span.tl {
    top: 12px;
    left: 12px;
    border-right: none;
    border-bottom: none;
  }

  > span.tr {
    top: 12px;
    right: 12px;
    border-left: none;
    border-bottom: none;
  }

  > span.bl {
    bottom: 12px;
    left: 12px;
    border-right: none;
    border-top: none;
  }

  > span.br {
    bottom: 12px;
    right: 12px;
    border-left: none;
    border-top: none;
  }
`

const scanAnimation = keyframes`
  0%   { top: 10%; }
  50%  { top: 90%; }
  100% { top: 10%; }
`

export const ScanLineAnimation = styled.div`
  position: absolute;
  left: 16px;
  right: 16px;
  height: 2px;
  background: red;
  animation: ${scanAnimation} 2s ease-in-out infinite;
  pointer-events: none;
`

export const CameraSwitchBtn = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;

  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
`

export const QrInstructions = styled.p`
  text-align: center;
  margin: 0;
  font-size: 14px;
`

export const QrSubText = styled.p`
  text-align: center;
  margin: 0;
  font-size: 12px;
  opacity: 0.6;
`
