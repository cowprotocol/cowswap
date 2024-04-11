import { useAtom, useAtomValue } from 'jotai'
import { useSetAtom } from 'jotai'
import { useCallback, useMemo, useRef, useState } from 'react'

import { openFortuneCookieAnalytics, shareFortuneTwitterAnalytics } from '@cowprotocol/analytics'
import fortuneCookieImage from '@cowprotocol/assets/cow-swap/fortune-cookie.png'
import twitterImage from '@cowprotocol/assets/cow-swap/twitter.svg'
import { addBodyClass, removeBodyClass } from '@cowprotocol/common-utils'
import { ExternalLink } from '@cowprotocol/ui'
import { UI } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import ReactDOM from 'react-dom'
import { X } from 'react-feather'
import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

import Confetti from 'legacy/components/Confetti'

import { useOpenRandomFortune } from 'modules/fortune/hooks/useOpenRandomFortune'
import { lastCheckedFortuneAtom } from 'modules/fortune/state/checkedFortunesListAtom'
import {
  fortuneStateAtom,
  isFortunesFeatureDisabledAtom,
  updateOpenFortuneAtom,
} from 'modules/fortune/state/fortuneStateAtom'

import { SuccessBanner } from './styled'

const FortuneButton = styled.div<{ isDailyFortuneChecked: boolean }>`
  --size: 64px;
  display: inline-block;
  position: fixed;
  z-index: 10;
  right: 78px;
  bottom: 30px;
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

  ${({ theme }) => theme.mediaWidth.upToMedium`
    --size: 52px;
    position: relative;
    right: initial;
    bottom: initial;
    transform: none;
    animation: none;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 0px;
    margin: 0px;
    font-weight: 600;
    font-size: 17px;
    padding: 15px 10px;
    color: inherit;
    border-bottom: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
    height: auto;
  `}

  &::before {
    content: '';
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

    ${({ theme }) => theme.mediaWidth.upToMedium`
      content: none;
      display: none;
    `}
  }

  &::after {
    --size: 90%;
    content: '';
    display: block;
    background: url(${fortuneCookieImage}) no-repeat center 100% / contain;
    width: var(--size);
    height: var(--size);
    transition: transform var(${UI.ANIMATION_DURATION}) ease-in-out;

    ${({ theme }) => theme.mediaWidth.upToMedium`
      --size: 46px;
    `}
  }

  &:hover::after {
    transform: scale(1.4);

    ${({ theme }) => theme.mediaWidth.upToMedium`
      transform: none;
    `}
  }

  > span {
    display: block;
    line-height: 1;
    text-align: left;
  }

  @keyframes floating {
    0% {
      transform: scale(1) rotate(10deg);
    }
    50% {
      transform: scale(1) rotate(-5deg);
    }
    52% {
      transform: scale(1.2) rotate(-5deg);
    }
    54% {
      transform: scale(1) rotate(-5deg);
    }
    56% {
      transform: scale(1.2) rotate(-5deg);
    }
    58% {
      transform: scale(1) rotate(-5deg);
    }
    100% {
      transform: scale(1) rotate(10deg);
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
  background: var(${UI.COLOR_PAPER_DARKER});
  padding: 0;
  animation: open var(${UI.ANIMATION_DURATION}) ease-in-out forwards;
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
  color: inherit;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 16px;
    margin: 16px auto 34px;
  `}

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
  color: ${({ theme }) => (theme.darkMode ? theme.bg1 : `var(${UI.COLOR_TEXT})`)};
  background: ${({ theme }) => theme.white};

  // small device
  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 21px;
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
    color: inherit;
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
  color: inherit;
`

const StyledExternalLink = styled(ExternalLink)`
  background: var(${UI.COLOR_PAPER_DARKER});
  border-radius: var(${UI.BORDER_RADIUS_NORMAL});
`

const HeaderElement = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: var(${UI.COLOR_PAPER_DARKER});
  position: fixed;
  padding: 0 16px;
  top: 0;
  left: 0;
  height: 56px;
  z-index: 10;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    height: 48px;
    justify-content: center;
    background: var(${UI.COLOR_PAPER_DARKEST});
  `}
`

const StyledCloseIcon = styled(X)`
  --size: 56px;
  height: var(--size);
  width: var(--size);
  opacity: 0.4;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;
  margin: 0 0 0 auto;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    --size: 34px;
    width: 100%;
    margin: 0;
  `}

  &:hover {
    cursor: pointer;
    opacity: 1;
  }

  > line {
    stroke: var(${UI.COLOR_TEXT});
  }
`

interface FortuneWidgetProps {
  menuTitle?: string
  isMobileMenuOpen?: boolean
}

export function FortuneWidget({ menuTitle, isMobileMenuOpen }: FortuneWidgetProps) {
  const { openFortune } = useAtomValue(fortuneStateAtom)
  const lastCheckedFortune = useAtomValue(lastCheckedFortuneAtom)
  const updateOpenFortune = useSetAtom(updateOpenFortuneAtom)
  const [isFortunesFeatureDisabled, setIsFortunesFeatureDisabled] = useAtom(isFortunesFeatureDisabledAtom)
  const openRandomFortune = useOpenRandomFortune()
  const [isNewFortuneOpen, setIsNewFortuneOpen] = useState(false)
  const [isFortunedShared, setIsFortunedShared] = useState(false)
  const checkboxRef = useRef<HTMLInputElement>(null)

  // TODO: add text
  const twitterText = openFortune
    ? encodeURIComponent(`My CoW fortune cookie 🐮💬: “${openFortune.text}” \n\n Get yours at swap.cow.fi @CoWSwap`)
    : ''

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

    // only remove body class if isMobileMenuOpen is false
    if (!isMobileMenuOpen) {
      removeBodyClass('noScroll')
    }

    if (checkboxRef.current?.checked) {
      setIsFortunesFeatureDisabled(true)
    }
  }, [updateOpenFortune, checkboxRef, setIsFortunesFeatureDisabled, isMobileMenuOpen])

  const openFortuneModal = useCallback(() => {
    setIsFortunedShared(false)
    openFortuneCookieAnalytics()

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
    shareFortuneTwitterAnalytics()
  }, [setIsFortunesFeatureDisabled])

  if (isFortunesFeatureDisabled && isDailyFortuneChecked && !openFortune) return null

  const PortalContent = () => (
    <>
      {openFortune && (
        <FortuneBanner>
          <FortuneBannerInner>
            <HeaderElement>
              <StyledCloseIcon onClick={closeModal} />
            </HeaderElement>
            <FortuneTitle>
              {isNewFortuneOpen
                ? 'CoW Fortune of the day'
                : "Already seen today's fortune? Return tomorrow for a fresh one!"}
            </FortuneTitle>
            <FortuneContent>
              <FortuneText>{openFortune.text}</FortuneText>
              <FortuneBannerActions>
                <StyledExternalLink
                  onClickOptional={onTweetShare}
                  href={`https://twitter.com/intent/tweet?text=${twitterText}`}
                >
                  <SuccessBanner type={'Twitter'}>
                    <Trans>Share on Twitter</Trans>
                    <SVG src={twitterImage} description="Twitter" />
                  </SuccessBanner>
                </StyledExternalLink>
                {!isNewFortuneOpen && !isFortunedShared && (
                  <DontShowAgainBox>
                    <label>
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
      <Confetti start={isNewFortuneOpen} />
    </>
  )

  return (
    <>
      <FortuneButton isDailyFortuneChecked={isDailyFortuneChecked} onClick={openFortuneModal}>
        {menuTitle && <span>{menuTitle}</span>}
      </FortuneButton>
      {ReactDOM.createPortal(<PortalContent />, document.body)}
    </>
  )
}
