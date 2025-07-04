import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const RouteHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  color: inherit;
  border-radius: var(${UI.BORDER_RADIUS_NORMAL});
`

export const ClickableRouteHeader = styled(RouteHeader)`
  cursor: pointer;
  transition: color var(${UI.ANIMATION_DURATION}) ease-in-out;
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
