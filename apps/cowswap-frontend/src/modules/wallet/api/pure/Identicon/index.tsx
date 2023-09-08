import React from 'react'

import styled from 'styled-components/macro'

import { UI } from 'common/constants/theme'

export const StyledIdenticon = styled.div`
  height: 1rem;
  width: 1rem;
  border-radius: 1.125rem;
  // background-color: ${({ theme }) => theme.bg4};
  background-color: var(${UI.COLOR_CONTAINER_BG_01}); // MOD
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
  onErrorFetchAvatar: () => void
}

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
