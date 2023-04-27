import { TradeFlowContext } from '@cow/modules/limitOrders/services/tradeFlow'
import { useWeb3React } from '@web3-react/core'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { useGnosisSafeInfo, useWalletDetails, useWalletInfo } from '@cow/modules/wallet'
import { useGP2SettlementContract } from 'hooks/useContract'
import { useDispatch } from 'react-redux'
import { AppDispatch } from 'state'
import useENSAddress from 'hooks/useENSAddress'
import { useLimitOrdersTradeState } from './useLimitOrdersTradeState'
import { OrderClass } from '@cowprotocol/cow-sdk'
import { useAtomValue } from 'jotai/utils'
import { limitOrdersQuoteAtom } from '@cow/modules/limitOrders/state/limitOrdersQuoteAtom'
import { useUpdateAtom } from 'jotai/utils'
import { addAppDataToUploadQueueAtom, appDataInfoAtom } from 'state/appData/atoms'
import { useRateImpact } from '@cow/modules/limitOrders/hooks/useRateImpact'
import { limitOrdersSettingsAtom } from '@cow/modules/limitOrders/state/limitOrdersSettingsAtom'
import { useFeatureFlags } from '@cow/common/hooks/useFeatureFlags'

export function useTradeFlowContext(): TradeFlowContext | null {
  const { provider } = useWeb3React()
  const { chainId, account } = useWalletInfo()
  const { allowsOffchainSigning } = useWalletDetails()
  const gnosisSafeInfo = useGnosisSafeInfo()
  const state = useLimitOrdersTradeState()
  const settlementContract = useGP2SettlementContract()
  const dispatch = useDispatch<AppDispatch>()
  const appData = useAtomValue(appDataInfoAtom)
  const addAppDataToUploadQueue = useUpdateAtom(addAppDataToUploadQueueAtom)
  const { address: ensRecipientAddress } = useENSAddress(state.recipient)
  const quoteState = useAtomValue(limitOrdersQuoteAtom)
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
    addAppDataToUploadQueue,
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
      appDataHash: appData.hash,
      quoteId,
    },
  }
}
