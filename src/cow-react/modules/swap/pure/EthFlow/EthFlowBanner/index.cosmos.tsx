import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { GpEther } from '@src/custom/constants/tokens'
import { Token } from '@uniswap/sdk-core'
import { EthFlowBannerContent, EthFlowBannerContentProps } from '.'

const defaultProps: EthFlowBannerContentProps = {
  native: GpEther.onChain(SupportedChainId.MAINNET),
  get wrapped() {
    return this.native.wrapped as Token & { logoURI: string }
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
