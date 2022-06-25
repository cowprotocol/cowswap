import styled from 'styled-components/macro'
import Sushi from 'assets/cow-swap/ammslogo/sushi.png'
import Paraswap from 'assets/cow-swap/ammslogo/paraswap.png'
import Oneinch from 'assets/cow-swap/ammslogo/1inch.png'
import Uniswap from 'assets/cow-swap/ammslogo/uniswap.png'
import Baoswap from 'assets/cow-swap/ammslogo/baoswap.png'
import Honeyswap from 'assets/cow-swap/ammslogo/honeyswap.png'
import Swapr from 'assets/cow-swap/ammslogo/swapr.png'
import Curve from 'assets/cow-swap/ammslogo/curve.png'
import Matcha from 'assets/cow-swap/ammslogo/matcha.png'
import ZeroX from 'assets/cow-swap/ammslogo/0x.png'
import { SupportedChainId } from 'constants/chains'

export const Wrapper = styled.div<{ logosLength: number }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 100%;
  box-shadow: 0px 0px 10px 2px ${({ theme }) => theme.bg1};
  background-color: ${({ theme }) => theme.white};
  transform-style: preserve-3d;
  position: absolute;
  top: -4px;
  right: 0px;

  img {
    position: absolute;
    left: 0;
    animation: FadeInOut 6s infinite;
  }
  @keyframes FadeInOut {
    0% {
      opacity: 1;
    }
    17% {
      opacity: 1;
    }
    25% {
      opacity: 0;
    }
    92% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  img:nth-of-type(1) {
    animation-delay: 6s;
  }
  img:nth-of-type(2) {
    animation-delay: 4.5s;
  }
  img:nth-of-type(3) {
    animation-delay: 3s;
  }
  img:nth-of-type(4) {
    animation-delay: 1.5s;
  }
`

type Image = { src: string; alt: string }

const SushiImage = { src: Sushi, alt: 'AMMs Sushi' }
const OneInchImage = { src: Oneinch, alt: 'AMMs 1inch' }
const ParaSwapImage = { src: Paraswap, alt: 'AMMs ParaSwap' }
const UniswapImage = { src: Uniswap, alt: 'AMMs Uniswap' }
const BaoSwapImage = { src: Baoswap, alt: 'AMMs BaoSwap' }
const HoneySwapImage = { src: Honeyswap, alt: 'AMMs HoneySwap' }
const SwaprImage = { src: Swapr, alt: 'AMMs Swapr' }
const CurveImage = { src: Curve, alt: 'AMMs Curve' }
const MatchaImage = { src: Matcha, alt: 'AMMs Matcha' }
const ZeroXImage = { src: ZeroX, alt: 'AMMs 0x' }

const LogosPerNetwork: Record<SupportedChainId, Array<Image>> = {
  [SupportedChainId.MAINNET]: [
    SushiImage,
    OneInchImage,
    ParaSwapImage,
    UniswapImage,
    CurveImage,
    MatchaImage,
    ZeroXImage,
  ],
  [SupportedChainId.RINKEBY]: [SushiImage, OneInchImage, ParaSwapImage, UniswapImage],
  [SupportedChainId.GNOSIS_CHAIN]: [SushiImage, BaoSwapImage, HoneySwapImage, SwaprImage],
}

export function AMMsLogo({ chainId }: { chainId: SupportedChainId }) {
  return (
    <Wrapper logosLength={LogosPerNetwork[chainId].length}>
      {LogosPerNetwork[chainId].map(({ src, alt }, index) => (
        <img key={index} src={src} alt={alt} />
      ))}
    </Wrapper>
  )
}
