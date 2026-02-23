import { ReactNode } from 'react'

import { getExplorerBaseUrl } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { Trans } from '@lingui/react/macro'

import * as styledEl from './ActiveRowLinks.styled'

export interface ActiveRowLinksProps {
  bridge: string | undefined
  explorer: string
  explorerTitle: string
  helpCenterUrl: string | undefined
  targetChainId: SupportedChainId
}

export function ActiveRowLinks({
  bridge,
  explorer,
  explorerTitle,
  helpCenterUrl,
  targetChainId,
}: ActiveRowLinksProps): ReactNode {
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
