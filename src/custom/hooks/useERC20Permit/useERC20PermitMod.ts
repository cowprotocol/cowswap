import { BigNumber } from '@ethersproject/bignumber'
// import { splitSignature } from '@ethersproject/bytes'
// import { Trade } from '@uniswap/router-sdk'
import { Currency, CurrencyAmount, Percent /*, TradeType */ } from '@uniswap/sdk-core'

import { useMemo /* , useState */ } from 'react'

// MOD imports
import { PermitInfo, SignatureData, UseERC20PermitState } from '@src/hooks/useERC20Permit'
import TradeGp from 'state/swap/TradeGp'
import { GP_VAULT_RELAYER } from 'custom/constants'
import { useWalletInfo } from '@cow/modules/wallet'

export * from '@src/hooks/useERC20Permit'

/* eslint-disable @typescript-eslint/no-unused-vars */
export function useERC20Permit(
  currencyAmount: CurrencyAmount<Currency> | null | undefined,
  spender: string | null | undefined,
  transactionDeadline: BigNumber | undefined,
  overridePermitInfo: PermitInfo | undefined | null
): {
  signatureData: SignatureData | null
  state: UseERC20PermitState
  gatherPermitSignature: null | (() => Promise<void>)
} {
  // Mod: make useERC20Permit a noop. Permissable ERC20 currently not supported by our contracts
  return {
    signatureData: null,
    state: UseERC20PermitState.NOT_APPLICABLE,
    gatherPermitSignature: null,
  }
}

export function useERC20PermitFromTrade(
  /* trade:
    | V2Trade<Currency, Currency, TradeType>
    | V3Trade<Currency, Currency, TradeType>
    | Trade<Currency, Currency, TradeType>
    | undefined, */
  trade: TradeGp | undefined,
  allowedSlippage: Percent,
  transactionDeadline: BigNumber | undefined
) {
  const { chainId } = useWalletInfo()
  /* const swapRouterAddress = chainId
    ? // v2 router does not support
      trade instanceof V2Trade
      ? undefined
      : trade instanceof V3Trade
      ? V3_ROUTER_ADDRESS[chainId]
      : SWAP_ROUTER_ADDRESSES[chainId]
    : undefined */
  const vaultRelayerAddress = chainId ? GP_VAULT_RELAYER[chainId] : undefined
  const amountToApprove = useMemo(
    () => (trade ? trade.maximumAmountIn(allowedSlippage) : undefined),
    [trade, allowedSlippage]
  )

  return useERC20Permit(amountToApprove, vaultRelayerAddress, transactionDeadline, null)
}
