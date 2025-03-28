import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  gap: 7px;
  padding: 0;
  font-size: 13px;
`

export const StopTitle = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  gap: 4px;
  margin: 0 0 0 -4px;
  font-weight: var(${UI.FONT_WEIGHT_MEDIUM});
`

export const RouteHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`

export const RouteTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: var(${UI.FONT_WEIGHT_MEDIUM});
`

export const StopsInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: var(${UI.FONT_WEIGHT_BOLD});
`

export const Link = styled.a`
  text-decoration: none;
  color: inherit;

  &:hover {
    text-decoration: underline;
  }
`

export const RecipientWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`

export const NetworkLogoWrapper = styled.div<{ size?: number }>`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: ${({ size = 16 }) => size}px;
  height: ${({ size = 16 }) => size}px;
  overflow: hidden;

  > img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: contain;
  }
`

export const AmountWithTokenIcon = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;

  > i {
    font-weight: var(${UI.FONT_WEIGHT_MEDIUM});
    letter-spacing: -0.2px;
  }
`

export const TokenFlowContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0 auto 0 0;
  letter-spacing: -0.2px;
`

export const ArrowIcon = styled.span`
  font-size: 13px;
  line-height: 1;
`
