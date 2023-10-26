import { NATIVE_CURRENCY_BUY_TOKEN } from '@cowprotocol/common-const'
import { getWrappedToken } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { EthFlowBannerContent, EthFlowBannerContentProps } from '.'

const defaultProps: EthFlowBannerContentProps = {
  native: NATIVE_CURRENCY_BUY_TOKEN[SupportedChainId.MAINNET],
  get wrapped() {
    return getWrappedToken(this.native)
  },
  showBanner: true,
  hasEnoughWrappedBalance: false,
  switchCurrencyCallback() {
    return console.log('Eth flow banner switch currency callback')
  },
  showBannerCallback() {
    return console.log('Eth flow banner open/close toggled!')
  },
  wrapCallback() {
    return console.log('Eth flow banner wrap callback called!')
  },
}

export default <EthFlowBannerContent {...defaultProps} />
