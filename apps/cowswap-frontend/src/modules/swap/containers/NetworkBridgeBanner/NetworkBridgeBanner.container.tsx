import { ReactNode } from 'react'

import { getChainInfo } from '@cowprotocol/common-const'
import { useTheme } from '@cowprotocol/common-hooks'
import { AutoRow } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { Trans } from '@lingui/react/macro'

import { useDarkModeManager } from 'legacy/state/user/hooks'

import { useInjectedWidgetParams } from 'modules/injectedWidget'

import * as styledEl from './NetworkBridgeBanner.styles'
import { shouldShowAlert } from './NetworkBridgeBanner.utils'

export function NetworkBridgeBanner(): ReactNode {
  const { active: isActive, chainId } = useWalletInfo()
  const { hideBridgeInfo } = useInjectedWidgetParams()
  const theme = useTheme()
  const [darkMode] = useDarkModeManager()
  const { label, logo, bridge } = getChainInfo(chainId)

  if (!shouldShowAlert(chainId) || !isActive || hideBridgeInfo || !bridge) {
    return null
  }

  const textColor = theme.text1
  const logoUrl = darkMode ? logo.dark : logo.light

  return (
    <styledEl.RootWrapper>
      <styledEl.ContentWrapper darkMode={darkMode} logoUrl={logoUrl}>
        <styledEl.LinkOutToBridge href={bridge}>
          <styledEl.BodyText color={textColor}>
            <styledEl.L2Icon src={logoUrl} />
            <AutoRow>
              <styledEl.Header>
                <Trans>{label} token bridge</Trans>
              </styledEl.Header>
              <styledEl.HideSmall>
                <Trans>Deposit tokens to the {label} network.</Trans>
              </styledEl.HideSmall>
            </AutoRow>
          </styledEl.BodyText>
          <styledEl.StyledArrowUpRight color={textColor} />
        </styledEl.LinkOutToBridge>
      </styledEl.ContentWrapper>
    </styledEl.RootWrapper>
  )
}
