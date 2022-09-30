import { TradeFlowContext } from 'cow-react/modules/limitOrders/services/tradeFlow'
import { useWeb3React } from '@web3-react/core'
import { OrderKind } from '@cowprotocol/contracts'
import { useLimitOrdersTradeState } from 'cow-react/modules/limitOrders/hooks/useLimitOrdersTradeState'
import { CurrencyAmount, Percent } from '@uniswap/sdk-core'
import { Token } from '@uniswap/sdk-core'
import { useWalletInfo } from 'hooks/useWalletInfo'
import { useGP2SettlementContract } from 'hooks/useContract'
import { useDispatch } from 'react-redux'
import { AppDispatch } from 'state'
import { useAppData } from 'hooks/useAppData'

// TODO: set proper values
const deadline = 5 // 5 min
const allowedSlippage = new Percent(0)
const recipientAddressOrName = null
const feeAmountRawValue = 60000000

export function useTradeFlowContext(): TradeFlowContext | null {
  const { chainId, account, provider } = useWeb3React()
  const state = useLimitOrdersTradeState()
  const { allowsOffchainSigning, gnosisSafeInfo } = useWalletInfo()
  const settlementContract = useGP2SettlementContract()
  const dispatch = useDispatch<AppDispatch>()
  // TODO: Not yet defined/discussed, but we might want to store more info the appData related to limit orders
  const appData = useAppData({ chainId, allowedSlippage })

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
  const validTo = Math.round(Date.now() / 1000 + 60 * deadline)
  const feeAmount = CurrencyAmount.fromRawAmount(state.inputCurrency, feeAmountRawValue)

  return {
    chainId,
    settlementContract,
    allowsOffchainSigning,
    isGnosisSafeWallet,
    dispatch,
    postOrderParams: {
      kind: OrderKind.SELL,
      signer: provider.getSigner(),
      account,
      chainId,
      inputAmount: state.inputCurrencyAmount,
      outputAmount: state.outputCurrencyAmount,
      sellAmountBeforeFee: state.inputCurrencyAmount,
      feeAmount,
      sellToken: state.inputCurrency as Token,
      buyToken: state.outputCurrency as Token,
      validTo,
      recipient: state.recipient || account,
      recipientAddressOrName,
      allowsOffchainSigning,
      appDataHash: appData.hash,
    },
  }
}
