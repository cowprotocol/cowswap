import { TradeFlowContext } from '@cow/modules/limitOrders/services/tradeFlow'
import { useWeb3React } from '@web3-react/core'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import { useWalletInfo } from 'hooks/useWalletInfo'
import { useGP2SettlementContract } from 'hooks/useContract'
import { useDispatch } from 'react-redux'
import { AppDispatch } from 'state'
import { useAppData } from 'hooks/useAppData'
import { LIMIT_ORDER_SLIPPAGE } from '@cow/modules/limitOrders/const/trade'
import useENSAddress from 'hooks/useENSAddress'
import { useLimitOrdersTradeState } from './useLimitOrdersTradeState'
import { useLimitOrdersDeadline } from './useLimitOrdersDeadline'

export function useTradeFlowContext(): TradeFlowContext | null {
  const { chainId, account, provider } = useWeb3React()
  const state = useLimitOrdersTradeState()
  const deadlineTimestamp = useLimitOrdersDeadline()
  const { allowsOffchainSigning, gnosisSafeInfo } = useWalletInfo()
  const settlementContract = useGP2SettlementContract()
  const dispatch = useDispatch<AppDispatch>()
  const appData = useAppData({ chainId, allowedSlippage: LIMIT_ORDER_SLIPPAGE })
  const { address: ensRecipientAddress } = useENSAddress(state.recipient)

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

  return {
    chainId,
    settlementContract,
    allowsOffchainSigning,
    isGnosisSafeWallet,
    dispatch,
    postOrderParams: {
      class: 'limit',
      kind: state.orderKind,
      account,
      chainId,
      sellToken,
      buyToken,
      validTo: deadlineTimestamp,
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
