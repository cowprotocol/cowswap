import styled from 'styled-components/macro'
import { useOpenRandomFortune } from '@cow/modules/fortune/hooks/useOpenRandomFortune'
import { useAtomValue } from 'jotai'
import { fortuneStateAtom, updateOpenFortuneAtom } from '@cow/modules/fortune/state/fortuneStateAtom'
import { useUpdateAtom } from 'jotai/utils'
import { lastCheckedFortuneAtom } from '@cow/modules/fortune/state/checkedFortunesListAtom'
import { useCallback, useMemo, useState } from 'react'
import { SuccessBanner } from '@cow/pages/Claim/styled'
import { Trans } from '@lingui/macro'
import SVG from 'react-inlinesvg'
import twitterImage from 'assets/cow-swap/twitter.svg'
import fortuneCookieImage from 'assets/cow-swap/fortune-cookie.png'
import { ExternalLink } from 'theme'
import { X } from 'react-feather'
import { transparentize } from 'polished'
import Confetti from 'components/Confetti'

const FortuneButton = styled.div`
  --size: 75px;
  display: inline-block;
  position: fixed;
  z-index: 500;
  right: 10px;
  bottom: 94px;
  width: var(--size);
  height: var(--size);
  border-radius: var(--size);
  text-align: center;
  animation: floating 3.5s ease-in-out forwards infinite;
  cursor: pointer;
  transform: scale(1);
  font-size: 40px;
  line-height: 0;
  color: ${({ theme }) => theme.blue1};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    --size: 52px;
    left: 65px;
    right: initial;
    bottom: 0;
  `}

  &::after {
    --size: 90%;
    content: "";
    display: block;
    background: url(${fortuneCookieImage}) no-repeat center 100%/contain;
    width: var(--size);
    height: var(--size);
    transition: transform 0.3s ease-in-out;
  }

  &:hover::after {
    transform: scale(1.4);
  }

  @keyframes floating {
    0% {
      transform: scale(1) rotate(10deg)
    }
    50% {
      transform: scale(1) rotate(-5deg)
    }
    52% {
      transform: scale(1.2) rotate(-5deg)
    }
    54% {
      transform: scale(1) rotate(-5deg)
    }
    56% {
      transform: scale(1.2) rotate(-5deg)
    }
    58% {
      transform: scale(1) rotate(-5deg)
    }
    100% {
      transform: scale(1) rotate(10deg)
    }
  }
}
`

const FortuneBanner = styled.div`
  position: fixed;
  width: 100vw;
  height: 100vh;
  right: 0;
  top: 0;
  left: 0;
  bottom: 0;
  margin: auto;
  z-index: 501;
  background: ${({ theme }) => transparentize(0.95, theme.text3)};
  backdrop-filter: blur(45px);
  padding: 32px;
  animation: open 0.3s ease-in-out forwards;
  overflow-y: auto;

  @keyframes open {
    from {
      transform: scale(0);
    }
    to {
      transform: scale(1);
    }
  }
`

const FortuneBannerActions = styled.div`
  display: flex;
  background: ${({ theme }) => theme.grey1};
  padding: 0;
  border-radius: 24px;

  > a {
    text-decoration: none !important;
  }

  // Tweet button
  > a > div {
    margin: 0;
    gap: 12px;
  }
`

const FortuneTitle = styled.h2`
  display: block;
  width: 100%;
  font-size: 21px;
  text-align: center;
  font-weight: 700;
  color: ${({ theme }) => theme.text2};

  > i {
    font-size: 16px;
    text-transform: uppercase;
    display: block;
    width: 100%;
    font-weight: 300;
    letter-spacing: 2px;
  }
`

const FortuneText = styled.h3`
  padding: 24px;
  width: 100%;
  font-size: 34px;
  border-radius: 42px;
  word-break: break-word;
  margin: 34px auto 70px;
  font-weight: 700;
  text-align: center;
  position: relative;
  background: ${({ theme }) => theme.grey1};

  &:before {
    content: '“';
    top: -70px;
    left: 0;
  }

  &:after {
    content: '”';
    bottom: -120px;
    right: 0;
  }

  &:before,
  &:after {
    font-size: 100px;
    position: absolute;
    z-index: 1;
    opacity: 0.3;
  }
`

const FortuneContent = styled.div`
  display: flex;
  flex-flow: column wrap;
  margin: 0 auto;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 500px;
`

const StyledCloseIcon = styled(X)`
  --size: 56px;
  position: absolute;
  top: 16px;
  right: 16px;
  height: var(--size);
  width: var(--size);
  opacity: 0.4;
  transition: opacity 0.3s ease-in-out;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    --size: 42px;
  `}

  &:hover {
    cursor: pointer;
    opacity: 1;
  }

  > line {
    stroke: ${({ theme }) => theme.text1};
  }
`

export function FortuneWidget() {
  const { openFortune } = useAtomValue(fortuneStateAtom)
  const lastCheckedFortune = useAtomValue(lastCheckedFortuneAtom)
  const updateOpenFortune = useUpdateAtom(updateOpenFortuneAtom)
  const openRandomFortune = useOpenRandomFortune()
  const [isNewFortuneOpen, setIsNewFortuneOpen] = useState(false)

  // TODO: add text
  const twitterText = openFortune ? openFortune.text : ''

  const isDailyFortuneChecked = useMemo(() => {
    if (!lastCheckedFortune) return false

    const lastCheckedFortuneDate = new Date(lastCheckedFortune.checkTimestamp)
    const today = new Date()

    return (
      lastCheckedFortuneDate.getUTCFullYear() === today.getUTCFullYear() &&
      lastCheckedFortuneDate.getUTCMonth() === today.getUTCMonth() &&
      lastCheckedFortuneDate.getUTCDate() === today.getUTCDate()
    )
  }, [lastCheckedFortune])

  const closeModal = useCallback(() => {
    updateOpenFortune(null)
    setIsNewFortuneOpen(false)
  }, [updateOpenFortune])

  const openFortuneModal = useCallback(() => {
    if (isDailyFortuneChecked && lastCheckedFortune) {
      updateOpenFortune(lastCheckedFortune.item)
    } else {
      openRandomFortune()
      setIsNewFortuneOpen(true)
    }
  }, [isDailyFortuneChecked, openRandomFortune, lastCheckedFortune, updateOpenFortune])

  return (
    <>
      {openFortune && (
        <FortuneBanner>
          <StyledCloseIcon onClick={closeModal}>Close</StyledCloseIcon>
          <FortuneTitle>
            CoW Fortune <i>of the day</i>
          </FortuneTitle>
          <FortuneContent>
            <FortuneText>{openFortune.text}</FortuneText>
            <FortuneBannerActions>
              <ExternalLink href={`https://twitter.com/intent/tweet?text=${twitterText}`}>
                <SuccessBanner type={'Twitter'}>
                  <span>
                    <Trans>Share on Twitter</Trans>
                  </span>
                  <SVG src={twitterImage} description="Twitter" />
                </SuccessBanner>
              </ExternalLink>
            </FortuneBannerActions>
          </FortuneContent>
        </FortuneBanner>
      )}
      <FortuneButton onClick={openFortuneModal}>{isDailyFortuneChecked ? '' : '*'}</FortuneButton>
      <Confetti start={isNewFortuneOpen} />
    </>
  )
}
