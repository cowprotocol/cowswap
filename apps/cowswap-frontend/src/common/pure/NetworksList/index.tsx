import { getChainInfo } from '@cowprotocol/common-const'
import { getExplorerBaseUrl } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { ExternalLink } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'

import * as styledEl from './styled'

export interface NetworksListProps {
  currentChainId: SupportedChainId | null
  isDarkMode: boolean
  availableChains: SupportedChainId[]
  onSelectChain(targetChainId: SupportedChainId): void
}

export function NetworksList(props: NetworksListProps) {
  const { currentChainId, isDarkMode, availableChains, onSelectChain } = props

  return (
    <>
      {availableChains.map((targetChainId: SupportedChainId) => {
        const info = getChainInfo(targetChainId)
        const { label, logo, bridge, explorer, explorerTitle, helpCenterUrl } = info

        const isActive = targetChainId === currentChainId
        const logoUrl = getLogo(isDarkMode, isActive, logo.dark, logo.light)

        const rowContent = (
          <styledEl.FlyoutRow key={targetChainId} onClick={() => onSelectChain(targetChainId)} active={isActive}>
            <styledEl.Logo src={logoUrl} />
            <styledEl.NetworkLabel>{label}</styledEl.NetworkLabel>
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
                <ExternalLink href={bridge}>
                  <Trans>Bridge</Trans>
                  <styledEl.LinkOutCircle />
                </ExternalLink>
              )}
              {explorer && (
                <ExternalLink href={explorer}>
                  <Trans>{explorerTitle}</Trans>
                  <styledEl.LinkOutCircle />
                </ExternalLink>
              )}
              {helpCenterUrl && (
                <ExternalLink href={helpCenterUrl}>
                  <Trans>Help Center</Trans>
                  <styledEl.LinkOutCircle />
                </ExternalLink>
              )}

              <ExternalLink href={getExplorerBaseUrl(targetChainId)}>
                <Trans>CoW Protocol Explorer</Trans>
                <styledEl.LinkOutCircle />
              </ExternalLink>
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
