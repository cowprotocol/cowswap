import { UI, Font, Media } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const LeftTop = styled.div`
  display: flex;
  flex-flow: column wrap;
  gap: 10px;
`

export const RightTop = styled.div`
  text-align: right;
  position: relative;
`

export const LeftBottom = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
`

export const ValueAmount = styled.span`
  font-size: 36px;
  font-weight: 500;
  margin: 0;

  ${Media.upToSmall()} {
    font-size: 18px;
  }

  > span {
    font-size: inherit;
    color: inherit;
    opacity: 1;
  }
`

export const ValueLabel = styled.span`
  font-size: 13px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

export const AddressDisplay = styled.span`
  font-size: 18px;
  font-weight: 600;
  font-family: ${Font.familyInter};
  font-feature-settings: 'ss10' on;

  ${Media.upToSmall()} {
    font-size: 14px;
  }
`
export const AddressLinkWrapper = styled.span`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  border-radius: 8px;
  padding: 2px;
  margin: -2px;
  transition: background 0.2s ease;

  &::after {
    content: '↗';
    font-size: 14px;
    opacity: 0;
    margin: 0;
    transition: opacity 0.2s ease;
    color: var(${UI.COLOR_TEXT_OPACITY_70});
  }

  &:hover::after,
  &:focus-within::after {
    opacity: 1;
  }

  &:focus-within {
    background: var(${UI.COLOR_TEXT_OPACITY_10});
    outline: 2px solid var(${UI.COLOR_PRIMARY});
    outline-offset: 2px;
  }
`
