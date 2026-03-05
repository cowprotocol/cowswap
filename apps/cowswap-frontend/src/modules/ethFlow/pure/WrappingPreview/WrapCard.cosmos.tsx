import { WRAPPED_NATIVE_CURRENCIES as WETH } from '@cowprotocol/common-const'
import { CurrencyAmount } from '@cowprotocol/common-entities'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { WrapCard } from './WrapCard'

const WrappedEther = WETH[SupportedChainId.SEPOLIA]
const wrapAmount = CurrencyAmount.fromRawAmount(WrappedEther, 5.21456 * 10 ** 18)
const balance = CurrencyAmount.fromRawAmount(WrappedEther, 15.12123 * 10 ** 18)

export default <WrapCard currency={WrappedEther} amountToWrap={wrapAmount} balance={balance} />
