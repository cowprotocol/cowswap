import { TradeFlowContext } from '@cow/modules/limitOrders/services/tradeFlow'
import { useWeb3React } from '@web3-react/core'
import { OrderKind } from '@cowprotocol/contracts'
import { useLimitOrdersTradeState } from '@cow/modules/limitOrders/hooks/useLimitOrdersTradeState'
import { CurrencyAmount } from '@uniswap/sdk-core'
import { Token } from '@uniswap/sdk-core'
import { useWalletInfo } from 'hooks/useWalletInfo'
import { useGP2SettlementContract } from 'hooks/useContract'
import { useDispatch } from 'react-redux'
import { AppDispatch } from 'state'
import { useAppData } from 'hooks/useAppData'
import { LIMIT_ORDER_SLIPPAGE } from '@cow/modules/limitOrders/const/trade'
import { SimpleGetQuoteResponse } from '@cowprotocol/cow-sdk'
import useENSAddress from 'hooks/useENSAddress'

export function useTradeFlowContext(limitOrdersQuote: SimpleGetQuoteResponse | null): TradeFlowContext | null {
  const { chainId, account, provider } = useWeb3React()
  const state = useLimitOrdersTradeState()
  const { allowsOffchainSigning, gnosisSafeInfo } = useWalletInfo()
  const settlementContract = useGP2SettlementContract()
  const dispatch = useDispatch<AppDispatch>()
  const appData = useAppData({ chainId, allowedSlippage: LIMIT_ORDER_SLIPPAGE })
  const { address: ensRecipientAddress } = useENSAddress(state.recipient)

  if (
    !limitOrdersQuote ||
    !chainId ||
    !account ||
    !state.inputCurrencyAmount ||
    !state.outputCurrencyAmount ||
    !state.inputCurrency ||
    !state.outputCurrency ||
    !state.deadline ||
    !provider ||
    !settlementContract ||
    !appData
  ) {
    return null
  }

  const isGnosisSafeWallet = !!gnosisSafeInfo
  const validTo = Math.round((Date.now() + state.deadline) / 1000)
  const recipientAddressOrName = state.recipient || ensRecipientAddress
  const recipient = ensRecipientAddress || state.recipient || account
  const sellToken = state.inputCurrency as Token
  const buyToken = state.outputCurrency as Token
  const feeAmount = CurrencyAmount.fromRawAmount(state.inputCurrency, +limitOrdersQuote.quote.feeAmount)

  return {
    chainId,
    settlementContract,
    allowsOffchainSigning,
    isGnosisSafeWallet,
    dispatch,
    postOrderParams: {
      kind: OrderKind.SELL,
      account,
      chainId,
      sellToken,
      buyToken,
      validTo,
      recipient,
      recipientAddressOrName,
      allowsOffchainSigning,
      feeAmount,
      signer: provider.getSigner(),
      inputAmount: state.inputCurrencyAmount,
      outputAmount: state.outputCurrencyAmount,
      sellAmountBeforeFee: state.inputCurrencyAmount,
      appDataHash: appData.hash,
    },
  }
}
