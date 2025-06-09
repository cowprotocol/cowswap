import React from 'react'

import { Command } from '@cowprotocol/types'

import styled from 'styled-components/macro'

export const StyledIdenticon = styled.div`
  height: 1rem;
  width: 1rem;
  border-radius: 1.125rem;
  background-color: var(--cow-container-bg-01); // MOD
  font-size: initial;
`

const StyledAvatar = styled.img`
  height: inherit;
  width: inherit;
  border-radius: inherit;
`

const Wrapper = styled.div<{ size?: number }>`
  ${StyledIdenticon} {
    height: ${({ size }) => (size ? `${size}px` : '1rem')};
    width: ${({ size }) => (size ? `${size}px` : '1rem')};
    border-radius: ${({ size }) => (size ? `${size}px` : '1rem')};
  }
`

export interface IdenticonProps {
  size?: number
  iconRef?: React.RefObject<HTMLDivElement>
  avatar: string | null
  showAvatar: boolean
  onErrorFetchAvatar: Command
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function Identicon({ size = 16, iconRef, onErrorFetchAvatar, avatar, showAvatar }: IdenticonProps) {
  return (
    <Wrapper size={size}>
      <StyledIdenticon>
        {avatar && showAvatar ? (
          <StyledAvatar alt="avatar" src={avatar} onError={onErrorFetchAvatar} />
        ) : (
          <span ref={iconRef} />
        )}
      </StyledIdenticon>
    </Wrapper>
  )
}
