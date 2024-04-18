import { useAtomValue } from 'jotai'

import { GP_VAULT_RELAYER } from '@cowprotocol/common-const'
import { OrderClass } from '@cowprotocol/cow-sdk'
import { useIsSafeWallet, useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'

import { useDispatch } from 'react-redux'

import { AppDispatch } from 'legacy/state'

import { useAppData } from 'modules/appData'
import { useRateImpact } from 'modules/limitOrders/hooks/useRateImpact'
import { TradeFlowContext } from 'modules/limitOrders/services/types'
import { limitOrdersSettingsAtom } from 'modules/limitOrders/state/limitOrdersSettingsAtom'
import { useGeneratePermitHook, useGetCachedPermit, usePermitInfo } from 'modules/permit'
import { useEnoughBalanceAndAllowance } from 'modules/tokens'
import { TradeType } from 'modules/trade'
import { useTradeQuote } from 'modules/tradeQuote'

import { useGP2SettlementContract } from 'common/hooks/useContract'

import { useLimitOrdersDerivedState } from './useLimitOrdersDerivedState'

export function useTradeFlowContext(): TradeFlowContext | null {
  const { provider } = useWeb3React()
  const { chainId, account } = useWalletInfo()
  const { allowsOffchainSigning } = useWalletDetails()
  const state = useLimitOrdersDerivedState()
  const isSafeWallet = useIsSafeWallet()
  const settlementContract = useGP2SettlementContract()
  const dispatch = useDispatch<AppDispatch>()
  const appData = useAppData()
  const quoteState = useTradeQuote()
  const rateImpact = useRateImpact()
  const settingsState = useAtomValue(limitOrdersSettingsAtom)
  const permitInfo = usePermitInfo(state.inputCurrency, TradeType.LIMIT_ORDER)

  const checkAllowanceAddress = GP_VAULT_RELAYER[chainId]
  const { enoughAllowance } = useEnoughBalanceAndAllowance({
    account,
    amount: state.slippageAdjustedSellAmount || undefined,
    checkAllowanceAddress,
  })
  const generatePermitHook = useGeneratePermitHook()
  const getCachedPermit = useGetCachedPermit()

  if (
    !chainId ||
    !account ||
    !state.inputCurrencyAmount ||
    !state.outputCurrencyAmount ||
    !state.inputCurrency ||
    !state.outputCurrency ||
    !provider ||
    !settlementContract ||
    !appData
  ) {
    return null
  }

  const recipientAddressOrName = state.recipient || state.recipientAddress
  const recipient = state.recipientAddress || state.recipient || account
  const sellToken = state.inputCurrency as Token
  const buyToken = state.outputCurrency as Token
  const feeAmount = CurrencyAmount.fromRawAmount(state.inputCurrency, 0)
  const quoteId = quoteState.response?.id || undefined

  const partiallyFillable = settingsState.partialFillsEnabled

  return {
    chainId,
    settlementContract,
    allowsOffchainSigning,
    dispatch,
    provider,
    rateImpact,
    permitInfo: !enoughAllowance ? permitInfo : undefined,
    generatePermitHook,
    getCachedPermit,
    quoteState,
    postOrderParams: {
      class: OrderClass.LIMIT,
      kind: state.orderKind,
      account,
      chainId,
      sellToken,
      buyToken,
      recipient,
      recipientAddressOrName,
      allowsOffchainSigning,
      feeAmount,
      inputAmount: state.inputCurrencyAmount,
      outputAmount: state.outputCurrencyAmount,
      sellAmountBeforeFee: state.inputCurrencyAmount,
      partiallyFillable,
      appData,
      quoteId,
      isSafeWallet,
    },
  }
}
