import React, { useState } from 'react'

import { Media, Color } from '@cowprotocol/ui'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { transparentize } from 'polished'
import styled from 'styled-components/macro'

import { faCircleCheck, faExclamationEllipsis, faExclamationTriangle } from './icons'

export interface NotificationProps {
  type: 'warn' | 'error' | 'success'
  message: string
  appendMessage?: boolean
  closable?: boolean
}

export const NotificationWrap = styled.p<{ isActive?: boolean; type: string }>`
  border-radius: 6px;
  padding: 10px 16px;
  background-color: ${({ type }): string =>
    type === 'error'
      ? transparentize(0.8, Color.explorer_buttonDanger)
      : type === 'warn'
        ? transparentize(0.8, Color.explorer_buttonWarning)
        : transparentize(0.8, Color.explorer_buttonSuccess)};
  font-size: 12px;
  display: ${({ isActive }): string => (isActive ? 'flex' : 'none')};
  align-items: center;
  margin: 0;

  span {
    flex-grow: 1;
    margin: 0 16px;
    line-height: 1.2;
    max-width: calc(100% - 90px);
    ${Media.upToSmall()} {
      max-width: none;
    }
    a {
      color: ${Color.cowfi_orange};
    }
  }

  .svg-inline--fa {
    color: ${({ type }): string =>
      type === 'error'
        ? Color.explorer_buttonDanger
        : type === 'warn'
          ? Color.explorer_buttonWarning
          : Color.explorer_buttonSuccess};
    width: 16px;
    height: 16px;
  }

  &:not(:last-of-type) {
    margin-bottom: 16px;
  }
`

const CloseButton = styled.button`
  cursor: pointer;
  border: 0;
  background-color: transparent;
  background-image: none;
  padding: 0;
  width: 40px;
  min-height: 20px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  position: relative;
  &:before,
  &:after {
    content: '';
    display: block;
    width: 20px;
    height: 2px;
    background-color: ${Color.neutral100};
    position: absolute;
  }
  &:after {
    transform: rotate(-45deg);
    left: 50%;
  }
  &:before {
    left: 50%;
    transform: rotate(45deg);
  }
`
const icon = {
  success: faCircleCheck,
  error: faExclamationEllipsis,
  warn: faExclamationTriangle,
}
export const Notification: React.FC<NotificationProps> = ({
  type,
  message,
  appendMessage = true,
  closable = true,
}: NotificationProps) => {
  const [isNoteActive, setIsNoteActive] = useState(true)
  const isError = type === 'error'
  return (
    <NotificationWrap type={type} isActive={isNoteActive}>
      <FontAwesomeIcon icon={icon[type]} />
      <span>
        {message}
        {appendMessage && (
          <>
            . Please&nbsp;
            <button onClick={(): void => window.location.reload()}>{isError ? 'try again ' : 'refresh '}</button>
            {isError ? 'later.' : 'to get the latest.'}
          </>
        )}
      </span>
      {closable && <CloseButton onClick={(): void => setIsNoteActive(false)} />}
    </NotificationWrap>
  )
}
