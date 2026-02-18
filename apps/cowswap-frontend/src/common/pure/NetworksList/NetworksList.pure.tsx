import { ReactNode } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { SupportedChainId, isChainDeprecated } from '@cowprotocol/cow-sdk'
import { Badge, BadgeTypes } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import { ActiveRowLinks } from './ActiveRowLinks/ActiveRowLinks.pure'
import * as styledEl from './NetworksList.styled'
import { getLogo } from './NetworksList.utils'

const NEW_NETWORK_IDS = new Set([SupportedChainId.PLASMA, SupportedChainId.INK])

export interface NetworksListProps {
  currentChainId: SupportedChainId | null
  isDarkMode: boolean
  availableChains: SupportedChainId[]
  onSelectChain(targetChainId: SupportedChainId): void
}

export function NetworksList({
  currentChainId,
  isDarkMode,
  availableChains,
  onSelectChain,
}: NetworksListProps): ReactNode {
  return (
    <>
      {availableChains.map((targetChainId: SupportedChainId) => {
        const info = getChainInfo(targetChainId)
        const { label, logo } = info

        const isActive = targetChainId === currentChainId
        const logoUrl = getLogo(isDarkMode, isActive, logo.dark, logo.light)
        const isNewNetwork = NEW_NETWORK_IDS.has(targetChainId)
        const isDeprecatedNetwork = isChainDeprecated(targetChainId)

        const rowContent = (
          <styledEl.FlyoutRow
            key={targetChainId}
            type="button"
            onClick={() => onSelectChain(targetChainId)}
            active={isActive}
          >
            <styledEl.Logo src={logoUrl} />
            <styledEl.NetworkLabel color={info.color}>{label}</styledEl.NetworkLabel>

            {isDeprecatedNetwork && (
              <Badge type={BadgeTypes.ALERT2} style={isActive ? { marginRight: '10px' } : undefined}>
                <Trans>VIEW ONLY</Trans>
              </Badge>
            )}

            {isNewNetwork && !isDeprecatedNetwork && (
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
            <ActiveRowLinks
              bridge={info.bridge}
              explorer={info.explorer}
              explorerTitle={info.explorerTitle}
              helpCenterUrl={info.helpCenterUrl}
              targetChainId={targetChainId}
            />
          </styledEl.ActiveRowWrapper>
        )
      })}
    </>
  )
}
