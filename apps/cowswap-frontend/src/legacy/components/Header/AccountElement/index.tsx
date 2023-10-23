import React from 'react'

import { NATIVE_CURRENCY_BUY_TOKEN } from '@cowprotocol/common-const'
import { TokenAmount } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useToggleAccountModal } from 'modules/account'
import { useNativeCurrencyBalances } from 'modules/tokens/hooks/useCurrencyBalance'
import { Web3Status } from 'modules/wallet/containers/Web3Status'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import { Wrapper, BalanceText } from './styled'

interface AccountElementProps {
  pendingActivities: string[]
  isWidgetMode?: boolean
  className?: string
}

export function AccountElement({ className, isWidgetMode, pendingActivities }: AccountElementProps) {
  const { account, chainId } = useWalletInfo()
  const isChainIdUnsupported = useIsProviderNetworkUnsupported()
  const userEthBalance = useNativeCurrencyBalances(account ? [account] : [])?.[account ?? '']
  const toggleAccountModal = useToggleAccountModal()
  const nativeToken = NATIVE_CURRENCY_BUY_TOKEN[chainId].symbol

  return (
    <Wrapper className={className} active={!!account} onClick={() => account && toggleAccountModal()}>
      {!isWidgetMode && account && !isChainIdUnsupported && userEthBalance && chainId && (
        <BalanceText>
          <TokenAmount amount={userEthBalance} tokenSymbol={{ symbol: nativeToken }} />
        </BalanceText>
      )}
      <Web3Status pendingActivities={pendingActivities} />
    </Wrapper>
  )
}
