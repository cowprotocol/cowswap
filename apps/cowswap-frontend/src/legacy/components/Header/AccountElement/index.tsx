import React from 'react'

import { useNativeCurrencyAmount } from '@cowprotocol/balances-and-allowances'
import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { TokenAmount } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useToggleAccountModal } from 'modules/account'
import { Web3Status } from 'modules/wallet/containers/Web3Status'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import { Wrapper, BalanceText } from './styled'

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

  return (
    <Wrapper className={className} active={!!account} onClick={() => account && toggleAccountModal()}>
      {standaloneMode && account && !isChainIdUnsupported && userEthBalance && chainId && (
        <BalanceText>
          <TokenAmount amount={userEthBalance} tokenSymbol={{ symbol: nativeToken }} />
        </BalanceText>
      )}
      <Web3Status pendingActivities={pendingActivities} />
    </Wrapper>
  )
}
