import { Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Container = styled.div`
  padding: 24px 12px;
  width: 100%;
  height: 100%;
  border-radius: 24px;
  background: var(${UI.COLOR_PAPER_DARKER});
  font-size: 14px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 20px;

  ${Media.upToSmall()} {
    font-size: 13px;
    letter-spacing: -0.1px;
  }
`

export const Amount = styled.div`
  font-size: 15px;
  font-weight: 600;
  display: flex;
  flex-flow: column wrap;
  gap: 6px;

  // Targets FiatValue
  > div {
    font-weight: 500;
    font-size: 13px;
  }
`

export const TokenLogoWrapper = styled.div`
  display: inline-block;
  border-radius: 50%;
  line-height: 0;
  box-shadow: 0 2px 10px 0 ${({ theme }) => (theme.darkMode ? '#496e9f' : '#bfd6f7')};
`
