import { SwapButtons, SwapButtonsContext } from '@cow/modules/swap/containers/SwapButtons/index'
import { USDC_GOERLI, WETH_GOERLI } from 'utils/goerli/constants'
import { CurrencyAmount, Percent, Price, TradeType } from '@uniswap/sdk-core'
import { SwapButtonState } from '@cow/modules/swap/helpers/getSwapButtonState'
import { ApprovalState } from 'hooks/useApproveCallback'
import { BigNumber } from '@ethersproject/bignumber'
import TradeGp from 'state/swap/TradeGp'
import { useSelect } from 'react-cosmos/fixture'

const currency = WETH_GOERLI
const currencyOut = USDC_GOERLI
const amount = 200000000
const output = 500000000
const fee = 100

const swapButtonsContext: SwapButtonsContext = {
  swapButtonState: SwapButtonState.RegularSwap,
  chainId: 1,
  wrappedToken: WETH_GOERLI,
  handleSwap: () => void 0,
  approveButtonProps: {
    currencyIn: currency,
    trade: new TradeGp({
      inputAmount: CurrencyAmount.fromRawAmount(currency, amount * 10 ** 18),
      inputAmountWithFee: CurrencyAmount.fromRawAmount(currency, (amount + fee) * 10 ** 18),
      inputAmountWithoutFee: CurrencyAmount.fromRawAmount(currency, amount * 10 ** 18),
      outputAmount: CurrencyAmount.fromRawAmount(currency, output * 10 ** 18),
      outputAmountWithoutFee: CurrencyAmount.fromRawAmount(currency, (output - 3) * 10 ** 18),
      fee: { feeAsCurrency: CurrencyAmount.fromRawAmount(currency, 3 * 10 ** 18), amount: '50' },
      executionPrice: new Price(currency, currencyOut, 1, 4),
      tradeType: TradeType.EXACT_INPUT,
      quoteId: 10000,
    }),
    allowedSlippage: new Percent(1),
    transactionDeadline: BigNumber.from(100000),
    isExpertMode: false,
    handleSwap: () => void 0,
    isValid: true,
    approvalState: ApprovalState.PENDING,
    approveCallback: () => Promise.resolve(undefined),
    approvalSubmitted: false,
    setApprovalSubmitted: () => void 0,
  },
  wrapUnwrapAmount: CurrencyAmount.fromRawAmount(WETH_GOERLI, 10000000),
  wrapInputError: undefined,
  onWrapOrUnwrap: null,
  onEthFlow: () => void 0,
  openSwapConfirm: () => void 0,
  toggleWalletModal: () => void 0,
  hasEnoughWrappedBalanceForSwap: true,
}

function useCustomProps(): SwapButtonsContext {
  const [swapButtonState] = useSelect('swapButtonState', {
    options: Object.values(SwapButtonState),
    defaultValue: SwapButtonState.NeedApprove,
  })
  const [approvalState] = useSelect('approvalState', {
    options: Object.values(ApprovalState),
    defaultValue: ApprovalState.PENDING,
  })

  return {
    ...swapButtonsContext,
    approveButtonProps: {
      ...swapButtonsContext.approveButtonProps,
      approvalState,
    },
    swapButtonState,
  }
}

const Default = () => {
  return <SwapButtons {...useCustomProps()} />
}

const Fixtures = {
  Default: <Default />,
}

export default Fixtures
