import ZeroX from '@cowprotocol/assets/cow-swap/ammslogo/0x.png'
import Oneinch from '@cowprotocol/assets/cow-swap/ammslogo/1inch.png'
import Balancer from '@cowprotocol/assets/cow-swap/ammslogo/balancer.png'
import Baoswap from '@cowprotocol/assets/cow-swap/ammslogo/baoswap.png'
import Curve from '@cowprotocol/assets/cow-swap/ammslogo/curve.png'
import Elk from '@cowprotocol/assets/cow-swap/ammslogo/elk.png'
import Honeyswap from '@cowprotocol/assets/cow-swap/ammslogo/honeyswap.png'
import Levinswap from '@cowprotocol/assets/cow-swap/ammslogo/levinswap.png'
import Matcha from '@cowprotocol/assets/cow-swap/ammslogo/matcha.png'
import Paraswap from '@cowprotocol/assets/cow-swap/ammslogo/paraswap.png'
import Sushi from '@cowprotocol/assets/cow-swap/ammslogo/sushi.png'
import Swapr from '@cowprotocol/assets/cow-swap/ammslogo/swapr.png'
import Symmetric from '@cowprotocol/assets/cow-swap/ammslogo/symmetric.png'
import Uniswap from '@cowprotocol/assets/cow-swap/ammslogo/uniswap.png'
import Gno from '@cowprotocol/assets/cow-swap/network-gnosis-chain-logo.svg'

const SushiImage = { src: Sushi, alt: 'AMMs Sushi' }
const OneInchImage = { src: Oneinch, alt: 'AMMs 1inch' }
const ParaSwapImage = { src: Paraswap, alt: 'AMMs ParaSwap' }
const UniswapImage = { src: Uniswap, alt: 'AMMs Uniswap' }
const BaoSwapImage = { src: Baoswap, alt: 'AMMs BaoSwap' }
const BalancerImage = { src: Balancer, alt: 'AMMs Balancer' }
const HoneySwapImage = { src: Honeyswap, alt: 'AMMs HoneySwap' }
const SwaprImage = { src: Swapr, alt: 'AMMs Swapr' }
const CurveImage = { src: Curve, alt: 'AMMs Curve' }
const MatchaImage = { src: Matcha, alt: 'AMMs Matcha' }
const ElkImage = { src: Elk, alt: 'AMMs Elk' }
const LevinSwapImage = { src: Levinswap, alt: 'Levinswap 0x' }
const SymmetricImage = { src: Symmetric, alt: 'Symmetric 0x' }
const ZeroXImage = { src: ZeroX, alt: 'AMMs 0x' }

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
  default: { src: Gno, alt: 'Default unknown AMM' },
}

