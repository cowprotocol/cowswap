import { ReactNode } from 'react'

import { AccountElement } from 'legacy/components/Header/AccountElement'
import { HeaderControls, HeaderElement } from 'legacy/components/Header/styled'

import { NetworkSelector } from 'modules/application/containers/NetworkSelector/NetworkSelector.container'
import { useInjectedWidgetParams } from 'modules/injectedWidget'

export function NetworkAndAccountControls(): ReactNode {
  const { hideNetworkSelector } = useInjectedWidgetParams()

  return (
    <HeaderControls>
      {!hideNetworkSelector && <NetworkSelector />}
      <HeaderElement>
        <AccountElement />
      </HeaderElement>
    </HeaderControls>
  )
}
