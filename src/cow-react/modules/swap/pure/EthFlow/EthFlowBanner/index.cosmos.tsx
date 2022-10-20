import { useDetectNativeToken } from '@src/custom/state/swap/hooks'
import { EthFlowBannerContent, EthFlowBannerContentProps } from '.'

const defaultProps: Omit<EthFlowBannerContentProps, 'wrapped' | 'native'> = {
  showBanner: true,
  showBannerCallback(state) {
    return console.log('Banner state:', state)
  },
  ethFlowCallback() {
    return console.log('Eth flow callback called!')
  },
}

const Custom = () => {
  const { wrappedToken: wrapped, native } = useDetectNativeToken()

  return <EthFlowBannerContent {...defaultProps} native={native} wrapped={wrapped} />
}

export default Custom
