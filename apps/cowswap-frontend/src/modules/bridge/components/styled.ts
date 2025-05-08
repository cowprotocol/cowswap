import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  gap: 7px;
  padding: 0;
  font-size: 13px;
  width: 100%;
`

export const StopNumberCircle = styled.div`
  --size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  background-color: var(${UI.COLOR_TEXT_OPACITY_15});
  color: var(${UI.COLOR_TEXT});
  font-weight: var(${UI.FONT_WEIGHT_BOLD});
  font-size: 13px;
`

export const StopTitle = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  gap: 6px;
  margin: 0 0 0 -4px;
  font-weight: var(${UI.FONT_WEIGHT_MEDIUM});
  font-size: 14px;

  > b {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3px;
  }
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
  gap: 4px;
  font-weight: var(${UI.FONT_WEIGHT_MEDIUM});
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
  flex-flow: row wrap;
  align-items: center;
  justify-content: flex-end;
  text-align: right;
  gap: 4px;
  word-break: break-word;
  line-height: 1;

  > i {
    font-weight: var(${UI.FONT_WEIGHT_MEDIUM});
    letter-spacing: -0.2px;
  }
`

export const TokenFlowContainer = styled.div`
  display: flex;
  align-items: center;
  flex-flow: row wrap;
  gap: 4px;
  margin: 0 auto 0 0;
  width: 100%;
`

export const ArrowIcon = styled.span`
  font-size: 13px;
  line-height: 1;
`

// Toggle arrow component for the collapsible header
export const ToggleArrow = styled.div<{ isOpen: boolean }>`
  --size: var(${UI.ICON_SIZE_SMALL});
  transform: ${({ isOpen }) => (isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: transform var(${UI.ANIMATION_DURATION}) ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--size);
  height: var(--size);

  > svg {
    --size: var(${UI.ICON_SIZE_TINY});
    width: var(--size);
    height: var(--size);
    object-fit: contain;
    transition: fill var(${UI.ANIMATION_DURATION}) ease-in-out;

    path {
      fill: var(${UI.COLOR_TEXT_OPACITY_70});
    }
  }
`

// Modified StopsInfo to include toggle arrow when collapsible
export const CollapsibleStopsInfo = styled(StopsInfo)`
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  transition: all var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    color: var(${UI.COLOR_TEXT});

    ${ToggleArrow} {
      > svg {
        path {
          fill: var(${UI.COLOR_TEXT});
        }
      }
    }
  }
`

// Add a styled version of RouteHeader with clickable behavior
export const ClickableRouteHeader = styled(RouteHeader)`
  cursor: pointer;

  &:hover {
    ${RouteTitle} {
      color: var(${UI.COLOR_TEXT});
    }
  }
`
