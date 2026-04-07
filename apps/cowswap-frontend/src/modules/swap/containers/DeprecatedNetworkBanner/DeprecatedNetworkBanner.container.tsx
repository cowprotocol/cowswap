import { ReactNode } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { useTheme } from '@cowprotocol/common-hooks'
import { getExplorerBaseUrl } from '@cowprotocol/common-utils'
import { AutoRow } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Trans } from '@lingui/react/macro'

import { useDarkModeManager } from 'legacy/state/user/hooks'

import { useIsProviderNetworkDeprecated } from 'common/hooks/useIsProviderNetworkDeprecated'

import * as styledEl from '../NetworkBridgeBanner/NetworkBridgeBanner.styles'

export function DeprecatedNetworkBanner(): ReactNode {
  const { chainId } = useWalletInfo()
  const isProviderNetworkDeprecated = useIsProviderNetworkDeprecated()
  const theme = useTheme()
  const [darkMode] = useDarkModeManager()

  if (!isProviderNetworkDeprecated || !chainId) {
    return null
  }

  const { label, logo } = getChainInfo(chainId)
  const textColor = theme.text1
  const logoUrl = darkMode ? logo.dark : logo.light
  const cowExplorerUrl = getExplorerBaseUrl(chainId)

  return (
    <styledEl.RootWrapper>
      <styledEl.ContentWrapper $logoUrl={cowExplorerUrl}>
        <styledEl.LinkOutToBridge href={cowExplorerUrl}>
          <styledEl.BodyText $color={textColor}>
            <styledEl.L2Icon src={logoUrl} />
            <AutoRow>
              <styledEl.Header>
                <Trans>{label} has been deactivated</Trans>
              </styledEl.Header>
              <styledEl.Small>
                <Trans>You can see your past transactions in Explorer</Trans>
              </styledEl.Small>
            </AutoRow>
          </styledEl.BodyText>
          <styledEl.StyledArrowUpRight color={textColor} />
        </styledEl.LinkOutToBridge>
      </styledEl.ContentWrapper>
    </styledEl.RootWrapper>
  )
}
