import { Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  margin-bottom: 20px;

  ${Media.upToSmall()} {
    padding: 0 14px;
  }

  &:last-child {
    margin-bottom: 0;
  }
`

export const ActiveToken = styled.div`
  color: var(${UI.COLOR_GREEN});
  display: flex;
  align-items: center;
  gap: 10px;
`
