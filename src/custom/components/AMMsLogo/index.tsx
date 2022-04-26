import styled from 'styled-components/macro'
import Sushi from 'assets/cow-swap/ammslogo/sushi.png'
import Paraswap from 'assets/cow-swap/ammslogo/paraswap.png'
import Oneinch from 'assets/cow-swap/ammslogo/1inch.png'
import Uniswap from 'assets/cow-swap/ammslogo/uniswap.png'
import { SupportedChainId } from 'constants/chains'

export const Wrapper = styled.div`
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

const SushiImage = { src: Sushi, alt: 'AMMs Sushiswap' }
const OneInchImage = { src: Oneinch, alt: 'AMMs 1inch' }
const ParaswapImage = { src: Paraswap, alt: 'AMMs Paraswap' }
const UniswapImage = { src: Uniswap, alt: 'AMMs Uniswap' }

const LogosPerNetwork: Record<SupportedChainId, Array<Image>> = {
  [SupportedChainId.MAINNET]: [SushiImage, OneInchImage, ParaswapImage, UniswapImage],
  [SupportedChainId.RINKEBY]: [SushiImage, OneInchImage, ParaswapImage, UniswapImage],
  [SupportedChainId.XDAI]: [SushiImage, OneInchImage, UniswapImage],
}

export function AMMsLogo({ chainId }: { chainId: SupportedChainId }) {
  return (
    <Wrapper>
      {LogosPerNetwork[chainId].map(({ src, alt }, index) => (
        <img key={index} src={src} alt={alt} />
      ))}
    </Wrapper>
  )
}
