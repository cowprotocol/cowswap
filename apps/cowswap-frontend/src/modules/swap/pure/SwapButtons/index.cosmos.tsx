import { WETH_SEPOLIA } from '@cowprotocol/common-const'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { useSelect } from 'react-cosmos/client'

import { Field } from 'legacy/state/types'

import { SwapButtonState } from 'modules/swap/helpers/getSwapButtonState'

import { SwapButtons, SwapButtonsContext } from './index'

const currency = WETH_SEPOLIA
const amount = 200000000

const swapButtonsContext: SwapButtonsContext = {
  onCurrencySelection(field: Field, currency): void {
    console.log('Currency selected', field, currency)
  },
  swapButtonState: SwapButtonState.RegularSwap,
  chainId: 1,
  wrappedToken: WETH_SEPOLIA,
  handleSwap: () => void 0,
  inputAmount: CurrencyAmount.fromRawAmount(currency, amount * 10 ** 18),
  onWrapOrUnwrap: null,
  onEthFlow: () => void 0,
  openSwapConfirm: () => void 0,
  toggleWalletModal: () => void 0,
  hasEnoughWrappedBalanceForSwap: true,
  recipientAddressOrName: null,
  quoteDeadlineParams: {
    validFor: 0,
    quoteValidTo: 0,
    localQuoteTimestamp: 0,
  },
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
