import { SetStateAction } from 'jotai'

import { COW_TOKEN_TO_CHAIN, GNO_MAINNET } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@cowprotocol/currency'

import { initLimitRateState } from 'modules/limitOrders/state/limitRateAtom'

import { LimitOrdersDetails } from './index'

const inputCurrency = COW_TOKEN_TO_CHAIN[SupportedChainId.MAINNET]
const outputCurrency = GNO_MAINNET

if (!inputCurrency) {
  throw new Error(`Input currency not found for chain ${SupportedChainId.MAINNET}`)
}

const rateInfoParams = {
  chainId: 5,
  inputCurrencyAmount: CurrencyAmount.fromRawAmount(inputCurrency, 123 * 10 ** 18),
  outputCurrencyAmount: CurrencyAmount.fromRawAmount(outputCurrency, 456 * 10 ** 18),
  activeRateFiatAmount: CurrencyAmount.fromRawAmount(outputCurrency, 2 * 10 ** 18),
  invertedActiveRateFiatAmount: CurrencyAmount.fromRawAmount(outputCurrency, 65 * 10 ** 18),
}

const Fixtures = {
  default: () => (
    <LimitOrdersDetails
      rateInfoParams={rateInfoParams}
      account="0x000"
      chainId={SupportedChainId.MAINNET}
      recipient="0xaaa"
      recipientAddressOrName={null}
      partiallyFillable={true}
      validTo={Math.floor(Date.now() / 1000) + 30 * 60}
      executionPrice={null}
      limitRateState={initLimitRateState()}
      partiallyFillableOverride={[true, (_?: SetStateAction<boolean | undefined>) => void 0]}
    />
  ),
}

export default Fixtures
