import { Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Wrapper = styled.div<{ hasBackground?: boolean }>`
  width: 100%;
  border-radius: var(${UI.BORDER_RADIUS_NORMAL});
  background: ${({ hasBackground }) => (hasBackground ? `var(${UI.COLOR_PAPER_DARKER})` : 'transparent')};
  display: flex;
  flex-flow: column wrap;
  gap: 4px;
  padding: ${({ hasBackground }) => (hasBackground ? '16px' : '0')};
  box-sizing: border-box;

  ${Media.upToSmall()} {
    padding: ${({ hasBackground }) => (hasBackground ? '10px' : '0')};
  }
`

export const RouteHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 3px 0;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  border-radius: var(${UI.BORDER_RADIUS_NORMAL});
  margin-bottom: 4px;
`

export const ClickableRouteHeader = styled(RouteHeader)`
  cursor: pointer;
  transition: color var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    color: var(${UI.COLOR_TEXT});
  }
`

export const RouteTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: var(${UI.FONT_WEIGHT_MEDIUM});
`

export const StopsInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: var(${UI.FONT_WEIGHT_MEDIUM});
`

export const CollapsibleStopsInfo = styled(StopsInfo)`
  display: flex;
  align-items: center;
`
