import { useAtomValue } from 'jotai/utils'

import { OrderClass } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { useWeb3React } from '@web3-react/core'

import { useDispatch } from 'react-redux'

import { useGP2SettlementContract } from 'legacy/hooks/useContract'
import useENSAddress from 'legacy/hooks/useENSAddress'
import { AppDispatch } from 'legacy/state'

import { useAppData } from 'modules/appData'
import { useRateImpact } from 'modules/limitOrders/hooks/useRateImpact'
import { TradeFlowContext } from 'modules/limitOrders/services/types'
import { limitOrdersSettingsAtom } from 'modules/limitOrders/state/limitOrdersSettingsAtom'
import { useTradeQuote } from 'modules/tradeQuote'
import { useGnosisSafeInfo, useWalletDetails, useWalletInfo } from 'modules/wallet'

import { useFeatureFlags } from 'common/hooks/featureFlags/useFeatureFlags'

import { useLimitOrdersDerivedState } from './useLimitOrdersDerivedState'

export function useTradeFlowContext(): TradeFlowContext | null {
  const { provider } = useWeb3React()
  const { chainId, account } = useWalletInfo()
  const { allowsOffchainSigning } = useWalletDetails()
  const gnosisSafeInfo = useGnosisSafeInfo()
  const state = useLimitOrdersDerivedState()
  const settlementContract = useGP2SettlementContract()
  const dispatch = useDispatch<AppDispatch>()
  const appData = useAppData()
  const { address: ensRecipientAddress } = useENSAddress(state.recipient)
  const quoteState = useTradeQuote()
  const rateImpact = useRateImpact()
  const settingsState = useAtomValue(limitOrdersSettingsAtom)
  const { partialFillsEnabled } = useFeatureFlags()

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

  const isGnosisSafeWallet = !!gnosisSafeInfo
  const recipientAddressOrName = state.recipient || ensRecipientAddress
  const recipient = ensRecipientAddress || state.recipient || account
  const sellToken = state.inputCurrency as Token
  const buyToken = state.outputCurrency as Token
  const feeAmount = CurrencyAmount.fromRawAmount(state.inputCurrency, 0)
  const quoteId = quoteState.response?.id || undefined

  // Depends on the feature flag to allow partial fills or not
  const partiallyFillable = partialFillsEnabled && settingsState.partialFillsEnabled

  return {
    chainId,
    settlementContract,
    allowsOffchainSigning,
    isGnosisSafeWallet,
    dispatch,
    provider,
    appData,
    rateImpact,
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
    },
  }
}
