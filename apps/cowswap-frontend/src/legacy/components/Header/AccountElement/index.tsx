import React, { useState } from 'react'

import { useNativeCurrencyAmount } from '@cowprotocol/balances-and-allowances'
import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { useFeatureFlags } from '@cowprotocol/common-hooks'
import { TokenAmount } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import ReactDOM from 'react-dom'

import { upToLarge, useMediaQuery } from 'legacy/hooks/useMediaQuery'

import { useToggleAccountModal } from 'modules/account'
import { NotificationBell, NotificationSidebar } from 'modules/notifications'
import { Web3Status } from 'modules/wallet/containers/Web3Status'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import { BalanceText, Wrapper } from './styled'

interface AccountElementProps {
  pendingActivities: string[]
  standaloneMode?: boolean
  className?: string
}

export function AccountElement({ className, standaloneMode, pendingActivities }: AccountElementProps) {
  const { account, chainId } = useWalletInfo()
  const isChainIdUnsupported = useIsProviderNetworkUnsupported()
  const userEthBalance = useNativeCurrencyAmount(chainId, account)
  const toggleAccountModal = useToggleAccountModal()
  const nativeToken = NATIVE_CURRENCIES[chainId].symbol
  const isUpToLarge = useMediaQuery(upToLarge)
  const { isNotificationsFeedEnabled } = useFeatureFlags()

  const [isSidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      <Wrapper className={className} active={!!account}>
        {standaloneMode !== false && account && !isChainIdUnsupported && userEthBalance && chainId && !isUpToLarge && (
          <BalanceText>
            <TokenAmount amount={userEthBalance} tokenSymbol={{ symbol: nativeToken }} />
          </BalanceText>
        )}
        <Web3Status pendingActivities={pendingActivities} onClick={() => account && toggleAccountModal()} />
        {account && isNotificationsFeedEnabled && <NotificationBell onClick={() => setSidebarOpen(true)} />}
      </Wrapper>

      {ReactDOM.createPortal(
        <NotificationSidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />,
        document.body
      )}
    </>
  )
}
