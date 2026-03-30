import { ReactNode, useMemo } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { SupportedChainId, TargetChainId } from '@cowprotocol/cow-sdk'
import { Badge, BadgeTypes, BaseItemComponentProps, List } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import { ActiveRowLinks } from './ActiveRowLinks/ActiveRowLinks.pure'
import * as styledEl from './NetworksList.styled'
import { getLogo } from './NetworksList.utils'

import { useDeprecatedChains } from '../../hooks/useDeprecatedChains'

const NEW_NETWORK_IDS: Set<TargetChainId> = new Set([SupportedChainId.PLASMA, SupportedChainId.INK])

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
  const deprecatedChains = useDeprecatedChains()

  const items = useMemo(() => {
    return availableChains.map((chainId: SupportedChainId) => {
      return {
        chainId,
        isActive: chainId === currentChainId,
        isNew: NEW_NETWORK_IDS.has(chainId),
        isDeprecated: deprecatedChains.has(chainId),
      } satisfies NetworkListItemData
    })
  }, [availableChains, deprecatedChains, currentChainId])

  return <List root="ul" itemComponent={NetworkListItem} items={items} extraProps={{ isDarkMode, onSelectChain }} />
}

export interface NetworkListItemData {
  chainId: SupportedChainId
  isActive: boolean
  isNew: boolean
  isDeprecated: boolean
}

export interface NetworkListItemExtraProps {
  isDarkMode: boolean
  onSelectChain(chainId: SupportedChainId): void
}

export type NetworkListItemProps = BaseItemComponentProps<NetworkListItemData, NetworkListItemExtraProps>

export function NetworkListItem({
  root: Root,
  data: { chainId, isActive, isNew, isDeprecated },
  extraProps: { isDarkMode, onSelectChain },
}: NetworkListItemProps): ReactNode {
  const info = getChainInfo(chainId)
  const { label, logo } = info
  const logoUrl = getLogo(isDarkMode, isActive, logo.dark, logo.light)

  const rowContent = (
    <styledEl.FlyoutRow
      key={chainId}
      type="button"
      // TODO: Use link instead.
      onClick={() => onSelectChain(chainId)}
      $active={isActive}
    >
      <styledEl.Logo src={logoUrl} />
      <styledEl.NetworkLabel color={info.color}>{label}</styledEl.NetworkLabel>

      {isDeprecated && (
        <Badge
          type={isDarkMode ? BadgeTypes.ALERT : isActive ? BadgeTypes.ALERT2 : BadgeTypes.ALERT}
          style={isActive ? { marginRight: '10px' } : undefined}
        >
          <Trans>READ-ONLY</Trans>
        </Badge>
      )}

      {isNew && !isDeprecated && (
        <Badge type={BadgeTypes.ALERT2} style={isActive ? { marginRight: '10px' } : undefined}>
          <Trans>NEW</Trans>
        </Badge>
      )}

      {isActive && <styledEl.FlyoutRowActiveIndicator $active />}
    </styledEl.FlyoutRow>
  )

  if (!isActive) {
    return <Root>{rowContent}</Root>
  }

  return (
    <styledEl.ActiveRowWrapper key={chainId} as={Root}>
      {rowContent}
      <ActiveRowLinks
        bridge={info.bridge}
        explorer={info.explorer}
        explorerTitle={info.explorerTitle}
        helpCenterUrl={info.helpCenterUrl}
        targetChainId={chainId}
      />
    </styledEl.ActiveRowWrapper>
  )
}
