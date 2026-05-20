import img0xSrc from '@cowprotocol/assets/cow-swap/ammslogo/0x.png'
import img1inchSrc from '@cowprotocol/assets/cow-swap/ammslogo/1inch.png'
import imgBalancerSrc from '@cowprotocol/assets/cow-swap/ammslogo/balancer.png'
import imgBaoswapSrc from '@cowprotocol/assets/cow-swap/ammslogo/baoswap.png'
import imgCurveSrc from '@cowprotocol/assets/cow-swap/ammslogo/curve.png'
import imgElkSrc from '@cowprotocol/assets/cow-swap/ammslogo/elk.png'
import imgHoneyswapSrc from '@cowprotocol/assets/cow-swap/ammslogo/honeyswap.png'
import imgLevinswapSrc from '@cowprotocol/assets/cow-swap/ammslogo/levinswap.png'
import imgMatchaSrc from '@cowprotocol/assets/cow-swap/ammslogo/matcha.png'
import imgParaswapSrc from '@cowprotocol/assets/cow-swap/ammslogo/paraswap.png'
import imgSushiSrc from '@cowprotocol/assets/cow-swap/ammslogo/sushi.png'
import imgSwaprSrc from '@cowprotocol/assets/cow-swap/ammslogo/swapr.png'
import imgSymmetricSrc from '@cowprotocol/assets/cow-swap/ammslogo/symmetric.png'
import imgUniswapSrc from '@cowprotocol/assets/cow-swap/ammslogo/uniswap.png'
import svgNetworkGnosisChainSrc from '@cowprotocol/assets/cow-swap/network-gnosis-chain-logo.svg'

const SushiImage = { src: imgSushiSrc, alt: 'AMMs Sushi' }
const OneInchImage = { src: img1inchSrc, alt: 'AMMs 1inch' }
const ParaSwapImage = { src: imgParaswapSrc, alt: 'AMMs ParaSwap' }
const UniswapImage = { src: imgUniswapSrc, alt: 'AMMs Uniswap' }
const BaoSwapImage = { src: imgBaoswapSrc, alt: 'AMMs BaoSwap' }
const BalancerImage = { src: imgBalancerSrc, alt: 'AMMs Balancer' }
const HoneySwapImage = { src: imgHoneyswapSrc, alt: 'AMMs HoneySwap' }
const SwaprImage = { src: imgSwaprSrc, alt: 'AMMs Swapr' }
const CurveImage = { src: imgCurveSrc, alt: 'AMMs Curve' }
const MatchaImage = { src: imgMatchaSrc, alt: 'AMMs Matcha' }
const ElkImage = { src: imgElkSrc, alt: 'AMMs Elk' }
const LevinSwapImage = { src: imgLevinswapSrc, alt: 'Levinswap 0x' }
const SymmetricImage = { src: imgSymmetricSrc, alt: 'Symmetric 0x' }
const ZeroXImage = { src: img0xSrc, alt: 'AMMs 0x' }

export const AMM_LOGOS: Record<string, typeof SushiImage> = {
  baoswap: BaoSwapImage,
  balancer: BalancerImage,
  curve: CurveImage,
  elk: ElkImage,
  honeyswap: HoneySwapImage,
  levinswap: LevinSwapImage,
  matcha: MatchaImage,
  oneinch: OneInchImage,
  paraswap: ParaSwapImage,
  sushi: SushiImage,
  swapr: SwaprImage,
  symmetric: SymmetricImage,
  uniswap: UniswapImage,
  zerox: ZeroXImage,
  default: { src: svgNetworkGnosisChainSrc, alt: 'Default unknown AMM' },
}
