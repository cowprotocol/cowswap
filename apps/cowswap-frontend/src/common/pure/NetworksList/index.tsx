import { ReactNode } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { getExplorerBaseUrl } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Badge, BadgeTypes } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import * as styledEl from './styled'

const NEW_NETWORK_IDS = new Set<SupportedChainId>([SupportedChainId.PLASMA, SupportedChainId.INK])

export interface NetworksListProps {
  currentChainId: SupportedChainId | null
  isDarkMode: boolean
  availableChains: SupportedChainId[]

  onSelectChain(targetChainId: SupportedChainId): void
}

// TODO: Break down this large function into smaller functions
export function NetworksList(props: NetworksListProps): ReactNode {
  const { currentChainId, isDarkMode, availableChains, onSelectChain } = props

  return (
    <>
      {/* TODO: Break down this large function into smaller functions */}
      {availableChains.map((targetChainId: SupportedChainId) => {
        const info = getChainInfo(targetChainId)
        const { label, logo, bridge, explorer, explorerTitle, helpCenterUrl } = info

        const isActive = targetChainId === currentChainId
        const logoUrl = getLogo(isDarkMode, isActive, logo.dark, logo.light)
        const isNewNetwork = NEW_NETWORK_IDS.has(targetChainId)

        const rowContent = (
          <styledEl.FlyoutRow
            key={targetChainId}
            type="button"
            onClick={() => onSelectChain(targetChainId)}
            active={isActive}
          >
            <styledEl.Logo src={logoUrl} />
            <styledEl.NetworkLabel color={info.color}>{label}</styledEl.NetworkLabel>
            {isNewNetwork && (
              <Badge type={BadgeTypes.ALERT2} style={isActive ? { marginRight: '10px' } : undefined}>
                <Trans>NEW</Trans>
              </Badge>
            )}
            {isActive && <styledEl.FlyoutRowActiveIndicator active />}
          </styledEl.FlyoutRow>
        )

        if (!isActive) {
          return rowContent
        }

        return (
          <styledEl.ActiveRowWrapper key={targetChainId}>
            {rowContent}
            <styledEl.ActiveRowLinkList>
              {bridge && (
                <styledEl.ActiveRowLink href={bridge}>
                  <styledEl.ActiveRowLinkLabel>
                    <Trans>Bridge</Trans>
                  </styledEl.ActiveRowLinkLabel>
                  <styledEl.LinkOutIconWrapper>
                    <styledEl.LinkOutCircle aria-hidden="true" />
                  </styledEl.LinkOutIconWrapper>
                </styledEl.ActiveRowLink>
              )}
              {explorer && (
                <styledEl.ActiveRowLink href={explorer}>
                  <styledEl.ActiveRowLinkLabel>{explorerTitle}</styledEl.ActiveRowLinkLabel>
                  <styledEl.LinkOutIconWrapper>
                    <styledEl.LinkOutCircle aria-hidden="true" />
                  </styledEl.LinkOutIconWrapper>
                </styledEl.ActiveRowLink>
              )}
              {helpCenterUrl && (
                <styledEl.ActiveRowLink href={helpCenterUrl}>
                  <styledEl.ActiveRowLinkLabel>
                    <Trans>Help Center</Trans>
                  </styledEl.ActiveRowLinkLabel>
                  <styledEl.LinkOutIconWrapper>
                    <styledEl.LinkOutCircle aria-hidden="true" />
                  </styledEl.LinkOutIconWrapper>
                </styledEl.ActiveRowLink>
              )}

              <styledEl.ActiveRowLink href={getExplorerBaseUrl(targetChainId)}>
                <styledEl.ActiveRowLinkLabel>
                  <Trans>CoW Protocol Explorer</Trans>
                </styledEl.ActiveRowLinkLabel>
                <styledEl.LinkOutIconWrapper>
                  <styledEl.LinkOutCircle aria-hidden="true" />
                </styledEl.LinkOutIconWrapper>
              </styledEl.ActiveRowLink>
            </styledEl.ActiveRowLinkList>
          </styledEl.ActiveRowWrapper>
        )
      })}
    </>
  )
}

function getLogo(isDarkMode: boolean, isActive: boolean, darkLogo: string, lightLogo: string): string {
  if (isDarkMode || isActive) {
    return darkLogo
  }

  return lightLogo
}
