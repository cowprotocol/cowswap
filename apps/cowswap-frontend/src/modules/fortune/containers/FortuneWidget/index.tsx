import { useAtom, useAtomValue } from 'jotai'
import { useSetAtom } from 'jotai'
import { useCallback, useRef, useState, useMemo } from 'react'

import twitterImage from '@cowprotocol/assets/cow-swap/twitter.svg'
import IMAGE_ICON_FORTUNE_COOKIE from '@cowprotocol/assets/images/icon-fortune-cookie.svg'
import { addBodyClass, removeBodyClass } from '@cowprotocol/common-utils'
import { ExternalLink, Media } from '@cowprotocol/ui'
import { UI, Color } from '@cowprotocol/ui'
import { Confetti } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import ReactDOM from 'react-dom'
import { X } from 'react-feather'
import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

import { useOpenRandomFortune } from 'modules/fortune/hooks/useOpenRandomFortune'
import { lastCheckedFortuneAtom } from 'modules/fortune/state/checkedFortunesListAtom'
import {
  fortuneStateAtom,
  isFortunesFeatureDisabledAtom,
  updateOpenFortuneAtom,
} from 'modules/fortune/state/fortuneStateAtom'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'

import { SuccessBanner } from './styled'

const FortuneButton = styled.div<{ isDailyFortuneChecked: boolean }>`
  --size: 32px;
  display: flex;

  width: var(--size);
  height: var(--size);
  text-align: center;
  animation: ${({ isDailyFortuneChecked }) =>
    isDailyFortuneChecked ? '' : 'floating 3.5s ease-in-out forwards infinite'};
  cursor: pointer;
  transform: scale(1);
  font-size: 40px;
  line-height: 0;
  color: inherit;

  &:hover {
    color: ${Color.neutral100};
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

  ${Media.upToMedium()} {
    font-size: 16px;
    margin: 16px auto 34px;
  }

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
  color: ${({ theme }) => (theme.darkMode ? theme.paper : `var(${UI.COLOR_TEXT})`)};
  background: ${({ theme }) => theme.white};

  // small device
  ${Media.upToMedium()} {
    font-size: 21px;
  }

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
    color: var(${UI.COLOR_TEXT_PAPER});
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

  ${Media.upToMedium()} {
    height: 48px;
    justify-content: center;
    background: var(${UI.COLOR_PAPER_DARKEST});
  }
`

const StyledCloseIcon = styled(X)`
  --size: 56px;
  height: var(--size);
  width: var(--size);
  opacity: 0.4;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;
  margin: 0 0 0 auto;

  ${Media.upToSmall()} {
    --size: 34px;
    width: 100%;
    margin: 0;
  }

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

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function FortuneWidget({ menuTitle, isMobileMenuOpen }: FortuneWidgetProps) {
  const { openFortune } = useAtomValue(fortuneStateAtom)
  const lastCheckedFortune = useAtomValue(lastCheckedFortuneAtom)
  const updateOpenFortune = useSetAtom(updateOpenFortuneAtom)
  const [isFortunesFeatureDisabled, setIsFortunesFeatureDisabled] = useAtom(isFortunesFeatureDisabledAtom)
  const openRandomFortune = useOpenRandomFortune()
  const [isNewFortuneOpen, setIsNewFortuneOpen] = useState(false)
  const [isFortunedShared, setIsFortunedShared] = useState(false)
  const checkboxRef = useRef<HTMLInputElement>(null)

  const twitterText = openFortune
    ? encodeURIComponent(`My CoW fortune cookie 🐮💬: "${openFortune.text}" \n\n Get yours at swap.cow.fi @CoWSwap`)
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

    if (!isMobileMenuOpen) {
      removeBodyClass('noScroll')
    }

    if (checkboxRef.current?.checked) {
      setIsFortunesFeatureDisabled(true)
    }
  }, [updateOpenFortune, checkboxRef, setIsFortunesFeatureDisabled, isMobileMenuOpen])

  const openFortuneModal = useCallback(() => {
    setIsFortunedShared(false)
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
  }, [setIsFortunesFeatureDisabled])

  if (isFortunesFeatureDisabled && isDailyFortuneChecked && !openFortune) return null

  // TODO: Extract nested component outside render function
  // TODO: Add proper return type annotation
  // eslint-disable-next-line react/no-unstable-nested-components, @typescript-eslint/explicit-function-return-type
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
                  data-click-event={toCowSwapGtmEvent({
                    category: CowSwapAnalyticsCategory.COW_FORTUNE,
                    action: 'Share on Twitter',
                  })}
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
      <FortuneButton
        isDailyFortuneChecked={isDailyFortuneChecked}
        onClick={openFortuneModal}
        data-click-event={toCowSwapGtmEvent({
          category: CowSwapAnalyticsCategory.COW_FORTUNE,
          action: 'Open Fortune Cookie',
        })}
      >
        <SVG src={IMAGE_ICON_FORTUNE_COOKIE} description="Fortune Cookie" />
        {menuTitle && <span>{menuTitle}</span>}
      </FortuneButton>
      {ReactDOM.createPortal(<PortalContent />, document.body)}
    </>
  )
}
