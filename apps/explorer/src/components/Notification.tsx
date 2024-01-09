import React, { useState } from 'react'
import styled from 'styled-components'
import { transparentize } from 'polished'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationEllipsis, faExclamationTriangle, faCircleCheck } from './icons'
import { BASE_COLOURS } from 'theme'
import { media } from 'theme/styles/media'

export interface NotificationProps {
  type: 'warn' | 'error' | 'success'
  message: string
  appendMessage?: boolean
  closable?: boolean
}

export const NotificationWrap = styled.p<{ isActive?: boolean; type: string }>`
  border-radius: 6px;
  padding: 10px 16px;
  background-color: ${({ theme, type }): string =>
    type === 'error'
      ? transparentize(0.8, theme.red4)
      : type === 'warn'
      ? transparentize(0.8, theme.orange)
      : transparentize(0.8, theme.green1)};
  font-size: 12px;
  display: ${({ isActive }): string => (isActive ? 'flex' : 'none')};
  align-items: center;
  margin: 0;

  span {
    flex-grow: 1;
    margin: 0 16px;
    line-height: 1.2;
    max-width: calc(100% - 90px);
    ${media.mobile} {
      max-width: none;
    }
    a {
      color: ${BASE_COLOURS.orange1};
    }
  }

  .svg-inline--fa {
    color: ${({ theme, type }): string =>
      type === 'error' ? theme.red4 : type === 'warn' ? theme.orange : theme.green1};
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
    background-color: ${({ theme }): string => theme.textPrimary1};
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
            <a onClick={(): void => window.location.reload()}>{isError ? 'try again ' : 'refresh '}</a>
            {isError ? 'later.' : 'to get the latest.'}
          </>
        )}
      </span>
      {closable && <CloseButton onClick={(): void => setIsNoteActive(false)} />}
    </NotificationWrap>
  )
}
