import { ReactNode } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { getExplorerBaseUrl } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Badge, BadgeTypes } from '@cowprotocol/ui'

import { Trans, useLingui } from '@lingui/react/macro'

import * as styledEl from './styled'

const NEW_NETWORK_IDS = new Set([SupportedChainId.PLASMA, SupportedChainId.INK])

export interface NetworksListProps {
  currentChainId: SupportedChainId | null
  isDarkMode: boolean
  availableChains: SupportedChainId[]
  disabledChainIds?: Set<number>

  onSelectChain(targetChainId: SupportedChainId): void
}

export function NetworksList(props: NetworksListProps): ReactNode {
  const { currentChainId, isDarkMode, availableChains, onSelectChain, disabledChainIds } = props
  const { t } = useLingui()

  return (
    <>
      {availableChains.map((targetChainId: SupportedChainId) => {
        const info = getChainInfo(targetChainId)
        const { label, logo } = info

        const isActive = targetChainId === currentChainId
        const isDisabled = disabledChainIds?.has(targetChainId) ?? false
        const logoUrl = getLogo(isDarkMode, isActive, logo.dark, logo.light)
        const isNewNetwork = NEW_NETWORK_IDS.has(targetChainId)

        const handleClick = (): void => {
          if (!isDisabled) {
            onSelectChain(targetChainId)
          }
        }

        const rowContent = (
          <styledEl.FlyoutRow
            key={targetChainId}
            type="button"
            onClick={handleClick}
            active={isActive}
            disabled$={isDisabled}
            title={
              isDisabled ? t`This chain is not supported by your connected wallet (Coinbase Smart Wallet)` : undefined
            }
            aria-disabled={isDisabled}
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
            <ActiveRowLinks info={info} targetChainId={targetChainId} />
          </styledEl.ActiveRowWrapper>
        )
      })}
    </>
  )
}

function ActiveRowLinks({
  info,
  targetChainId,
}: {
  info: ReturnType<typeof getChainInfo>
  targetChainId: SupportedChainId
}): ReactNode {
  const { bridge, explorer, explorerTitle, helpCenterUrl } = info

  return (
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
  )
}

function getLogo(isDarkMode: boolean, isActive: boolean, darkLogo: string, lightLogo: string): string {
  if (isDarkMode || isActive) {
    return darkLogo
  }

  return lightLogo
}
