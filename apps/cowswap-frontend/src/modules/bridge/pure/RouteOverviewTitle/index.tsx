import { ReactNode } from 'react'

import { BridgeProviderInfo } from '@cowprotocol/sdk-bridging'
import { InfoTooltip } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import { ToggleArrow } from 'common/pure/ToggleArrow'

import { ClickableRouteHeader, CollapsibleStopsInfo, RouteHeader, RouteTitle, StopsInfo } from './styled'

import { COW_PROTOCOL_NAME } from '../../constants'
import { ProtocolIcons } from '../ProtocolIcons'

interface RouteOverviewTitleProps {
  isCollapsible: boolean
  isExpanded: boolean
  providerInfo: BridgeProviderInfo
  onClick(): void
}

export function RouteOverviewTitle({
  isCollapsible,
  isExpanded,
  providerInfo,
  onClick,
}: RouteOverviewTitleProps): ReactNode {
  const HeaderComponent = isCollapsible ? ClickableRouteHeader : RouteHeader
  const providerInfoName = providerInfo.name

  return (
    <HeaderComponent onClick={isCollapsible ? onClick : undefined}>
      <RouteTitle>
        <Trans>Route</Trans>{' '}
        <InfoTooltip
          content={
            <Trans>
              Your trade will be executed in 2 stops. First, you swap on <b>{COW_PROTOCOL_NAME} (Stop 1)</b>, then you
              bridge via <b>{providerInfoName} (Stop 2)</b>.
            </Trans>
          }
          size={14}
        />
      </RouteTitle>
      {isCollapsible ? (
        <CollapsibleStopsInfo>
          <Trans>2 stops</Trans>
          <ProtocolIcons secondProtocol={providerInfo} />
          <ToggleArrow isOpen={isExpanded} />
        </CollapsibleStopsInfo>
      ) : (
        <StopsInfo>
          <Trans>2 stops</Trans>
          <ProtocolIcons secondProtocol={providerInfo} />
        </StopsInfo>
      )}
    </HeaderComponent>
  )
}
