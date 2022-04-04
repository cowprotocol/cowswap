import styled from 'styled-components/macro'
import Sushi from 'assets/cow-swap/ammslogo/sushi.png'
import Paraswap from 'assets/cow-swap/ammslogo/paraswap.png'
import Oneinch from 'assets/cow-swap/ammslogo/1inch.png'
import uniswap from 'assets/cow-swap/ammslogo/uniswap.png'

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
    animation-delay: 4s;
  }
  img:nth-of-type(3) {
    animation-delay: 2s;
  }
  img:nth-of-type(4) {
    animation-delay: 1s;
  }
`

export function AMMsLogo() {
  return (
    <Wrapper>
      <img src={Sushi} alt="AMMs Sushiswap" />
      <img src={Oneinch} alt="AMMs 1inch" />
      <img src={Paraswap} alt="AMMs Paraswap" />
      <img src={uniswap} alt="AMMs Uniswap" />
    </Wrapper>
  )
}
