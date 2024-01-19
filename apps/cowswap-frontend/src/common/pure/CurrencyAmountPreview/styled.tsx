import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Container = styled.div`
  padding: 24px 12px;
  width: 100%;
  border-radius: 24px;
  background: var(${UI.COLOR_PAPER_DARKER});
  font-size: 14px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 14px;
`

export const Amount = styled.div`
  font-size: 15px;
  font-weight: 600;
`

export const TokenLogoWrapper = styled.div`
  display: inline-block;
  border-radius: 50%;
  line-height: 0;
  box-shadow: 0 2px 10px 0 ${({ theme }) => (theme.darkMode ? '#496e9f' : '#bfd6f7')};
`
