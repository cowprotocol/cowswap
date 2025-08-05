import { ReactNode, useState } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useLocation } from 'react-router'

import { CoWShedWidget } from 'modules/cowShed'
import { useSwapRawState } from 'modules/swap'
import { useTradeNavigate } from 'modules/trade'

import { Routes } from 'common/constants/routes'

export function CowShed(): ReactNode {
  const { chainId } = useWalletInfo()
  const tradeNavigate = useTradeNavigate()
  const { inputCurrencyId, outputCurrencyId } = useSwapRawState()
  const location = useLocation()

  const query = new URLSearchParams(location.search)
  const [sourceRoute] = useState<string>(query.get('source') || 'swap')

  const onDismiss = (): void => {
    tradeNavigate(
      chainId,
      { inputCurrencyId, outputCurrencyId },
      undefined,
      sourceRoute === 'hooks' ? Routes.HOOKS : Routes.SWAP,
    )
  }

  return (
    <>
      <CoWShedWidget onDismiss={onDismiss} modalMode={false} />
    </>
  )
}
