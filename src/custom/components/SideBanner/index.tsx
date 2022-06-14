import { useState, useEffect, useMemo } from 'react'
import styled from 'styled-components/macro'
import AnniversaryImage from 'assets/cow-swap/anniversary-icons.png'
import TwitterImage from 'assets/cow-swap/twitter.svg'
import ReactConfetti from 'react-confetti'
import { transparentize } from 'polished'
import SVG from 'react-inlinesvg'
import { CloseIcon, ExternalLink } from 'theme'
import { IS_SIDE_BANNER_VISIBLE_KEY } from '@src/constants/misc'

const WIDTH = 440
const HEIGHT = 440
const ANNIVERSARY_TWEET_TEMPLATE =
  'Holy CoW, today @MEVprotection is 1 year old! Check out their UI growth over time to see the CoW-evolution https://youtu.be/nxU11DmBVMk'

// create an enum with the types of banners we want to show
export enum BannerType {
  ANNIVERSARY = 'anniversary',
}
export interface BannerProps {
  type: BannerType
}

const Banner = styled.div<{ isActive: boolean }>`
  position: fixed;
  width: ${`${WIDTH}px`};
  height: ${`${HEIGHT}px`};
  left: 28px;
  bottom: 86px;
  background: linear-gradient(180deg, ${({ theme }) => theme.blueShade} 0%, #091e32 100%);
  box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.4);
  border-radius: 16px;
  display: ${({ isActive }) => (isActive ? 'flex' : 'none')};
  z-index: 9999;
  overflow: hidden;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    bottom: 0;
    left: 0;
    width: 100%;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  `};
`

const StyledTwitterIcon = styled(SVG)``

const StyledClose = styled(CloseIcon)`
  position: absolute;
  right: 16px;
  top: 16px;
  color: ${({ theme }) => theme.white};
  opacity: 0.5;
  transition: opacity 0.2s ease-in-out;

  &:hover {
    opacity: 1;
    cursor: pointer;
  }
`

const BannerContainer = styled.div`
  display: flex;
  flex-flow: column wrap;
  flex: 1;
  justify-content: flex-start;
  padding: 16px;
  height: 100%;
  width: 100%;

  > h3 {
    font-weight: 500;
    font-size: 23px;
    text-align: center;
    color: ${({ theme }) => theme.white};
    margin: 16px 0 32px;

    ${({ theme }) => theme.mediaWidth.upToSmall`
      font-size: 18px;
    `};
  }

  > img {
    width: 100%;
    object-fit: contain;
  }
`

const FooterContent = styled.div`
  display: flex;
  flex-flow: column wrap;
  width: 100%;
  margin: auto 0 0;

  > p {
    color: ${({ theme }) => theme.white};
    font-size: 15px;
    text-align: center;
    width: 100%;
  }

  > a:hover {
    text-decoration: none;
  }

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 21px;
    font-size: 16px;
    font-weight: bold;
    appearance: none;
    border: 0;
    color: ${({ theme }) => theme.orange};
    background: ${({ theme }) => transparentize(0.85, theme.orange)};
    border-radius: 16px;
    transition: color 0.15s ease-in-out, background 0.15s ease-in-out;
    text-decoration: none;

    > ${StyledTwitterIcon} {
      fill: ${({ theme }) => theme.orange};
      margin: 0 6px 0 0;
    }

    &:hover {
      cursor: pointer;
      text-decoration: none;
      color: ${({ theme }) => theme.black};
      background: ${({ theme }) => theme.orange};

      > ${StyledTwitterIcon} {
        fill: ${({ theme }) => theme.black};
      }
    }
  }
`

const getShowBannerState = (key: string) => {
  const localStorageValue = localStorage.getItem(key)

  // item doesn't exist, show banner (true)
  if (localStorageValue === null) return true

  // else return localstorage state (!! for type safety)
  return !!JSON.parse(localStorageValue)
}

export default function SideBanner({ type }: BannerProps) {
  const isSideBannerVisible = useMemo(() => getShowBannerState(IS_SIDE_BANNER_VISIBLE_KEY), []) // empty array only calls on mount
  const [isActive, setIsActive] = useState(isSideBannerVisible)

  const handleClose = () => {
    setIsActive(false)
  }

  useEffect(() => {
    if (!isActive) {
      // set a localstorage key to prevent banner from showing again
      localStorage.setItem(IS_SIDE_BANNER_VISIBLE_KEY, 'false')
    }
  }, [isActive])

  return (
    <Banner isActive={isActive}>
      {type === 'anniversary' && (
        <BannerContainer>
          <ReactConfetti numberOfPieces={25} width={WIDTH} height={HEIGHT} recycle={true} run={true} />
          <h3>
            Celebrating year one
            <br />
            of the ever evolving COW 🎉
          </h3>
          <img src={AnniversaryImage} height="162" alt="CowSwap evolving icons" />
          <FooterContent>
            <p>Share and be eligible for a celebratory NFT!</p>
            <ExternalLink href={`https://twitter.com/intent/tweet?text=${ANNIVERSARY_TWEET_TEMPLATE}`}>
              <button>
                <StyledTwitterIcon src={TwitterImage} height="18" width="18" description="Share CowSwap on Twitter" />
                Share on Twitter
              </button>
            </ExternalLink>
          </FooterContent>
        </BannerContainer>
      )}
      <StyledClose size={24} onClick={handleClose} />
    </Banner>
  )
}
