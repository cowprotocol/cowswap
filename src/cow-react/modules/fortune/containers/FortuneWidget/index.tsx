import styled from 'styled-components/macro'
import { useOpenRandomFortune } from '@cow/modules/fortune/hooks/useOpenRandomFortune'
import { useAtomValue } from 'jotai'
import {
  fortuneStateAtom,
  showFortuneButtonAtom,
  updateOpenFortuneAtom,
} from '@cow/modules/fortune/state/fortuneStateAtom'
import { useUpdateAtom } from 'jotai/utils'
import { lastCheckedFortuneAtom } from '@cow/modules/fortune/state/checkedFortunesListAtom'
import { useEffect } from 'react'
import { SuccessBanner } from '@cow/pages/Claim/styled'
import { Trans } from '@lingui/macro'
import SVG from 'react-inlinesvg'
import twitterImage from 'assets/cow-swap/twitter.svg'
import { ExternalLink } from 'theme'
import { ButtonPrimary } from 'components/Button'

const FortuneButton = styled.div`
  @keyframes glowing {
    from {
      box-shadow: 0 0 10px #fff, 0 0 20px #fff, 0 0 30px #f0f, 0 0 40px #0ff, 0 0 50px #e60073, 0 0 60px #e60073,
        0 0 70px #e60073;
    }
    to {
      box-shadow: 0 0 20px #fff, 0 0 30px #ff4da6, 0 0 40px #ff4da6, 0 0 50px #ff4da6, 0 0 60px #ff4da6,
        0 0 70px #ff4da6, 0 0 80px #ff4da6;
    }
  }

  @keyframes swinging {
    0% {
      transform: rotate(10deg) translateY(0px);
    }
    50% {
      transform: rotate(-5deg) translateY(30px);
    }
    100% {
      transform: rotate(10deg) translateY(0px);
    }
  }

  display: inline-block;
  position: fixed;
  z-index: 500;
  right: 100px;
  bottom: 100px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  text-align: center;
  animation: glowing 1s ease-in-out infinite alternate, swinging 3.5s ease-in-out forwards infinite;
  cursor: pointer;

  &:before {
    content: '🎉';
    font-size: 76px;
    position: relative;
    top: -27px;
    left: -7px;
  }
`

const FortuneBanner = styled.div`
  position: fixed;
  right: 50px;
  bottom: 20%;
  z-index: 501;
  background: #fff;
  padding: 20px;
  box-shadow: 0 0 20px #fff, 0 0 30px #ff4da6, 0 0 40px #ff4da6, 0 0 50px #ff4da6, 0 0 60px #ff4da6, 0 0 70px #ff4da6,
    0 0 80px #ff4da6;
  border-radius: 12px;
`

const FortuneBannerActions = styled.div`
  display: block;
`

const FortuneText = styled.h3`
  margin-top: 0;
  padding: 20px;
  font-size: 25px;
  max-width: 400px;
  border-radius: 40px;
  position: relative;
  background: rgba(255, 77, 166, 0.09);

  &:before {
    content: '“';
    left: -5px;
    top: 30px;
  }

  &:after {
    content: '”';
    right: -5px;
    bottom: -15px;
  }

  &:before,
  &:after {
    font-size: 82px;
    position: absolute;
    z-index: 1;
    line-height: 0;
  }
`

const ONE_DAY = 60 * 60 * 24

// TODO: add styles
export function FortuneWidget() {
  const { openFortune, isFortuneButtonVisible } = useAtomValue(fortuneStateAtom)
  const lastCheckedFortune = useAtomValue(lastCheckedFortuneAtom)
  const updateOpenFortune = useUpdateAtom(updateOpenFortuneAtom)
  const showFortuneButton = useUpdateAtom(showFortuneButtonAtom)
  const openRandomFortune = useOpenRandomFortune()

  // TODO: add text
  const twitterText = openFortune ? openFortune.text : ''

  // Show fortune button once a day
  // TODO: improve logic
  useEffect(() => {
    if (isFortuneButtonVisible) return

    const lastFortuneWasOpenDayAgo = lastCheckedFortune ? Date.now() / 1000 - lastCheckedFortune > ONE_DAY : true

    if (lastFortuneWasOpenDayAgo) {
      showFortuneButton()
    }
  }, [isFortuneButtonVisible, lastCheckedFortune, showFortuneButton])

  return (
    <>
      {openFortune && (
        <FortuneBanner>
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
            <ButtonPrimary onClick={() => updateOpenFortune({ openFortune: null })}>Close</ButtonPrimary>
          </FortuneBannerActions>
        </FortuneBanner>
      )}
      {isFortuneButtonVisible && <FortuneButton onClick={openRandomFortune}></FortuneButton>}
    </>
  )
}
