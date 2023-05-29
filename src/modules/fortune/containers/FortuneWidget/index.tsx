import { useAtom, useAtomValue } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'
import { useCallback, useMemo, useRef, useState } from 'react'

import { Trans } from '@lingui/macro'
import { X } from 'react-feather'
import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

import fortuneCookieImage from 'legacy/assets/cow-swap/fortune-cookie.png'
import twitterImage from 'legacy/assets/cow-swap/twitter.svg'
import { sendEvent } from 'legacy/components/analytics'
import Confetti from 'legacy/components/Confetti'
import { ExternalLink } from 'legacy/theme'
import { addBodyClass, removeBodyClass } from 'legacy/utils/toggleBodyClass'

import { useOpenRandomFortune } from 'modules/fortune/hooks/useOpenRandomFortune'
import { lastCheckedFortuneAtom } from 'modules/fortune/state/checkedFortunesListAtom'
import {
  fortuneStateAtom,
  isFortunesFeatureDisabledAtom,
  updateOpenFortuneAtom,
} from 'modules/fortune/state/fortuneStateAtom'

import useInterval from 'lib/hooks/useInterval'
import { SuccessBanner } from 'pages/Claim/styled'

const FortuneButton = styled.div<{ isDailyFortuneChecked: boolean }>`
  --size: 75px;
  display: inline-block;
  position: fixed;
  z-index: 10;
  right: 10px;
  bottom: 94px;
  width: var(--size);
  height: var(--size);
  border-radius: var(--size);
  text-align: center;
  animation: ${({ isDailyFortuneChecked }) =>
    isDailyFortuneChecked ? '' : 'floating 3.5s ease-in-out forwards infinite'};
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

  &::before {
    content: "";
    display: block;
    height: 10px;
    width: 10px;
    background: transparent;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    margin: auto;
    box-shadow: 0px 0px 50px 30px ${({ theme }) => (theme.darkMode ? theme.blueDark2 : theme.blueLight1)};
    z-index: -1;

    ${({ theme }) => theme.mediaWidth.upToSmall`
      box-shadow: none;
    `}
  }

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
  z-index: 501;
  background: ${({ theme }) => theme.grey1};
  padding: 0;
  animation: open 0.3s ease-in-out forwards;
  overflow: hidden;

  @keyframes open {
    from {
      transform: scale(0);
    }
    to {
      transform: scale(1);
    }
  }
`

const FortuneBannerInner = styled.div`
  position: relative;
  display: block;
  width: 100%;
  height: 100vh;
  overflow-y: auto;
  padding: 56px 32px 100px;
  margin: auto;
`

const FortuneBannerActions = styled.div`
  display: flex;
  flex-direction: column;

  > a {
    text-decoration: none !important;
  }

  // Tweet button
  > a > div {
    margin: 0;
    gap: 12px;
  }
`

const DontShowAgainBox = styled.div`
  text-align: center;
  margin-top: 30px;

  > label {
    cursor: pointer;
    display: inline-flex;
    align-items: center;
  }

  > label input {
    width: 18px;
    height: 18px;
    margin-right: 8px;
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
  padding: 21px;
  width: 100%;
  font-size: 32px;
  border-radius: 42px;
  word-break: break-word;
  margin: 34px auto 70px;
  font-weight: 700;
  text-align: center;
  position: relative;
  color: ${({ theme }) => (theme.darkMode ? theme.bg1 : theme.text1)};
  background: ${({ theme }) => theme.white};

  // small device
  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 26px;
  `}

  &:before {
    content: '“';
    top: -60px;
    left: 0;
  }

  &:after {
    content: '”';
    bottom: -110px;
    right: 0;
  }

  &:before,
  &:after {
    color: ${({ theme }) => theme.text1};
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
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  max-width: 500px;
  color: ${({ theme }) => theme.text1};
`

const StyledExternalLink = styled(ExternalLink)`
  background: ${({ theme }) => theme.grey1};
  border-radius: 24px;
`

const HeaderElement = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: ${({ theme }) => theme.grey1};
  position: fixed;
  padding: 0 16px;
  top: 0;
  left: 0;
  height: 56px;
  z-index: 10;
`

const StyledCloseIcon = styled(X)`
  --size: 56px;
  height: var(--size);
  width: var(--size);
  opacity: 0.4;
  transition: opacity 0.3s ease-in-out;
  margin: 0 0 0 auto;

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
  const [isFortunesFeatureDisabled, setIsFortunesFeatureDisabled] = useAtom(isFortunesFeatureDisabledAtom)
  const openRandomFortune = useOpenRandomFortune()
  const [isNewFortuneOpen, setIsNewFortuneOpen] = useState(false)
  const [isFortunedShared, setIsFortunedShared] = useState(false)

  const [today, setToday] = useState(new Date())
  useInterval(() => setToday(new Date()), 2_000)

  const checkboxRef = useRef<HTMLInputElement>(null)

  // TODO: add text
  const twitterText = openFortune
    ? encodeURIComponent(`My CoW fortune cookie 🐮💬: “${openFortune.text}” \n\n Get yours at swap.cow.fi @CoWSwap`)
    : ''

  const isDailyFortuneChecked = useMemo(() => {
    if (!lastCheckedFortune) return false

    const lastCheckedFortuneDate = new Date(lastCheckedFortune.checkTimestamp)

    return (
      lastCheckedFortuneDate.getUTCFullYear() === today.getUTCFullYear() &&
      lastCheckedFortuneDate.getUTCMonth() === today.getUTCMonth() &&
      lastCheckedFortuneDate.getUTCDate() === today.getUTCDate()
    )
  }, [lastCheckedFortune, today])

  const closeModal = useCallback(() => {
    updateOpenFortune(null)
    setIsNewFortuneOpen(false)
    removeBodyClass('noScroll')

    if (checkboxRef.current?.checked) {
      setIsFortunesFeatureDisabled(true)
    }
  }, [updateOpenFortune, checkboxRef, setIsFortunesFeatureDisabled])

  const openFortuneModal = useCallback(() => {
    setIsFortunedShared(false)

    // Add the 'noScroll' class on body, whenever the fortune modal is opened/closed.
    // This removes the inner scrollbar on the page body, to prevent showing double scrollbars.
    addBodyClass('noScroll')

    if (isDailyFortuneChecked && lastCheckedFortune) {
      updateOpenFortune(lastCheckedFortune.item)
    } else {
      setIsFortunesFeatureDisabled(false)
      openRandomFortune()
      setIsNewFortuneOpen(true)
    }
  }, [isDailyFortuneChecked, openRandomFortune, lastCheckedFortune, updateOpenFortune, setIsFortunesFeatureDisabled])

  const onTweetShare = useCallback(() => {
    setIsFortunesFeatureDisabled(true)
    setIsFortunedShared(true)
    sendEvent({
      category: 'CoWFortune',
      action: 'Share on Twitter',
    })
  }, [setIsFortunesFeatureDisabled])

  if (isFortunesFeatureDisabled && isDailyFortuneChecked && !openFortune) return null

  return (
    <>
      {openFortune && (
        <FortuneBanner>
          <FortuneBannerInner>
            <HeaderElement>
              <StyledCloseIcon onClick={closeModal}>Close</StyledCloseIcon>
            </HeaderElement>
            <FortuneTitle>
              {isNewFortuneOpen ? (
                <>
                  CoW Fortune <i>of the day</i>
                </>
              ) : (
                <>
                  Already seen today's fortune? <br /> Return tomorrow for a fresh one!
                </>
              )}
            </FortuneTitle>
            <FortuneContent>
              <FortuneText>{openFortune.text}</FortuneText>
              <FortuneBannerActions>
                <StyledExternalLink
                  onClickOptional={onTweetShare}
                  href={`https://twitter.com/intent/tweet?text=${twitterText}`}
                >
                  <SuccessBanner type={'Twitter'}>
                    <span>
                      <Trans>Share on Twitter</Trans>
                    </span>
                    <SVG src={twitterImage} description="Twitter" />
                  </SuccessBanner>
                </StyledExternalLink>
                {!isNewFortuneOpen && !isFortunedShared && (
                  <DontShowAgainBox>
                    <label>
                      {/*// TODO: tooltip with explanation*/}
                      <input type="checkbox" ref={checkboxRef} />
                      <span>Hide today's fortune cookie</span>
                    </label>
                  </DontShowAgainBox>
                )}
              </FortuneBannerActions>
            </FortuneContent>
          </FortuneBannerInner>
        </FortuneBanner>
      )}
      <FortuneButton isDailyFortuneChecked={isDailyFortuneChecked} onClick={openFortuneModal}></FortuneButton>
      <Confetti start={isNewFortuneOpen} />
    </>
  )
}
