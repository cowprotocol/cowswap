import { WETH_GOERLI } from 'utils/goerli/constants'
import { CurrencyAmount } from '@uniswap/sdk-core'
import { SwapButtonState } from 'modules/swap/helpers/getSwapButtonState'
import { useSelect } from 'react-cosmos/fixture'
import { SwapButtons, SwapButtonsContext } from './index'
import { Field } from 'state/swap/actions'

const currency = WETH_GOERLI
const amount = 200000000

const swapButtonsContext: SwapButtonsContext = {
  onCurrencySelection(field: Field, currency): void {
    console.log('Currency selected', field, currency)
  },
  swapButtonState: SwapButtonState.RegularSwap,
  chainId: 1,
  wrappedToken: WETH_GOERLI,
  handleSwap: () => void 0,
  inputAmount: CurrencyAmount.fromRawAmount(currency, amount * 10 ** 18),
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

  return {
    ...swapButtonsContext,
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
