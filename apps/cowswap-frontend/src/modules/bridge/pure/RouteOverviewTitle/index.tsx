import { BridgeProviderInfo } from '@cowprotocol/cow-sdk'
import { InfoTooltip } from '@cowprotocol/ui'

import { ToggleArrow } from 'common/pure/ToggleArrow'

import { ClickableRouteHeader, CollapsibleStopsInfo, RouteHeader, RouteTitle, StopsInfo } from './styled'

import { ProtocolIcons } from '../ProtocolIcons'

interface RouteOverviewTitleProps {
  isCollapsible: boolean
  isExpanded: boolean
  providerInfo: BridgeProviderInfo
  onClick(): void
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function RouteOverviewTitle({ isCollapsible, isExpanded, providerInfo, onClick }: RouteOverviewTitleProps) {
  const HeaderComponent = isCollapsible ? ClickableRouteHeader : RouteHeader

  return (
    <HeaderComponent onClick={isCollapsible ? onClick : undefined}>
      <RouteTitle>
        Route{' '}
        <InfoTooltip
          content={
            <>
              Your trade will be executed in 2 stops. First, you swap on <b>CoW Protocol (Stop 1)</b>, then you bridge
              via <b>{providerInfo.name} (Stop 2)</b>.
            </>
          }
          size={14}
        />
      </RouteTitle>
      {isCollapsible ? (
        <CollapsibleStopsInfo>
          2 stops
          <ProtocolIcons secondProtocol={providerInfo} />
          <ToggleArrow isOpen={isExpanded} />
        </CollapsibleStopsInfo>
      ) : (
        <StopsInfo>
          2 stops
          <ProtocolIcons secondProtocol={providerInfo} />
        </StopsInfo>
      )}
    </HeaderComponent>
  )
}
