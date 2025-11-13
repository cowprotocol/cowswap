import { Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Wrapper = styled.div<{ $isFirst?: boolean; $isLast?: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: ${({ $isFirst, $isLast }) => `${$isFirst ? '20px' : '0'} 20px ${$isLast ? '0' : '20px'} 20px`};

  ${Media.upToSmall()} {
    padding: ${({ $isFirst, $isLast }) => `${$isFirst ? '20px' : '0'} 14px ${$isLast ? '0' : '20px'} 14px`};
  }
`

export const ActiveToken = styled.div`
  color: var(${UI.COLOR_GREEN});
  display: flex;
  align-items: center;
  gap: 10px;
`
