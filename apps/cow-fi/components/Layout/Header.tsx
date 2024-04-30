import { useState, forwardRef } from 'react'
import styled, { css } from 'styled-components'
import Link from 'next/link'
import { transparentize } from 'polished'
import { Button, ButtonVariant } from 'components/Button'
import { Defaults, Color, Font, Media } from 'styles/variables'
import { InView } from 'react-intersection-observer'
import useMediaQuery from 'lib/hooks/useMediaQuery'
import { CustomLink as CustomLink } from '../CustomLink'
import { CONFIG } from '@/const/meta'
import { HEADER_LINKS } from '@/const/menu'
import { LinkWithUtm } from 'modules/utm'
import { sendGAEventHandler } from 'lib/analytics/sendGAEvent'
import { NavigationEvents, GAEventCategories } from 'lib/analytics/GAEvents'

const LogoImage = '/images/logo.svg'
const LogoImageThemedCoWAMM = '/images/logo-themed-cowamm.svg'
const LogoLightImage = '/images/logo-light.svg'
const LogoLightImageThemedCoWAMM = '/images/logo-light-themed-cowamm.svg'
const LogoIconImage = '/images/logo-icon.svg'
const LogoIconImageThemedCoWAMM = '/images/logo-icon-themed-cowamm.svg'
const LogoIconLightImage = '/images/logo-icon-light.svg'
const LogoIconLightImageThemedCoWAMM = '/images/logo-icon-light-themed-cowamm.svg'
const MenuImage = '/images/icons/menu.svg'
const MenuImageLight = '/images/icons/menu-light.svg'
const MenuImageThemedCoWAMM = '/images/icons/menu-cowamm.svg'
const MenuImageLightThemedCoWAMM = '/images/icons/menu-cowamm-light.svg'

interface PixelProps {
  children?: React.ReactNode
}

const StyledPixel = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 1px;
  height: 1px;
  display: block;
  background: transparent;
`

const Pixel = forwardRef<HTMLDivElement, PixelProps>((props, ref) => (
  <StyledPixel ref={ref}>{props.children}</StyledPixel>
))

Pixel.displayName = 'Pixel'

const Wrapper = styled.header<{ isSticky?: boolean }>`
  z-index: 10;
  width: 100%;
  height: 7.2rem;
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-flow: row;
  justify-content: space-between;
  align-items: center;
  background: transparent;
  padding: 0 5.6rem;
  margin: 0 auto;
  top: 0;
  left: 0;
  transition: background 0.2s ease-in-out, height 0.2s ease-in-out;

  ${Media.mediumDown} {
    padding: 0 1.6rem;
    height: 6rem;
  }

  ${({ isSticky }) =>
    isSticky &&
    css`
      background: ${transparentize(0.2, Color.white)};
      backdrop-filter: blur(1rem);
      box-shadow: 0 0.4rem 0.6rem 0 rgba(51, 57, 75, 0.1);
      position: fixed;
      top: 0;
    `}
`

const Content = styled.div`
  width: 100%;
  max-width: ${Defaults.pageMaxWidth}rem;
  display: flex;
  margin: 0 auto;
  justify-content: space-between;
  align-items: center;
`

const Menu = styled.ol<{ isLight?: boolean; isLightCoWAMM?: boolean; isSticky?: boolean; menuVisible?: boolean }>`
  display: flex;
  list-style: none;
  font-size: 1.5rem;
  font-weight: ${Font.weightMedium};
  color: ${({ isLight, isLightCoWAMM }) =>
    isLightCoWAMM ? Color.cowammWhite : isLight ? Color.darkBlue : Color.lightBlue};
  padding: 0;
  margin: 0;

  ${({ isSticky, isLightCoWAMM }) =>
    isSticky &&
    css`
      color: ${isLightCoWAMM ? Color.cowammBlack : Color.darkBlue};
    `}

  ${Media.mediumDown} {
    display: none;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: ${({ isLightCoWAMM }) => (isLightCoWAMM ? Color.cowammBlack : Color.darkBlue)};
    color: ${({ isLightCoWAMM }) => (isLightCoWAMM ? Color.cowammWhite : Color.text2)};
    justify-content: flex-start;
    align-items: flex-start;
    align-content: flex-start;
    flex-flow: row wrap;
    gap: 3rem;
    overflow-y: auto;

    ${({ menuVisible }) =>
      menuVisible &&
      css`
        position: fixed;
        display: flex;
        padding: 12rem 6rem 6rem;
        font-size: 3.2rem;

        ${Media.mobile} {
          font-size: 2rem;
        }
      `}
  }

  // any buttons or links right after menu
  + a {
    background: transparent;
    border: 0.1rem solid
      ${({ isLightCoWAMM, isLight }) =>
        isLightCoWAMM ? Color.cowammWhite : isLight ? Color.darkBlue : Color.lightBlue};
    color: ${({ isLight, isLightCoWAMM }) =>
      isLightCoWAMM ? Color.cowammWhite : isLight ? Color.darkBlue : Color.lightBlue};

    ${({ isSticky, isLightCoWAMM, isLight }) =>
      isSticky &&
      css`
        background: transparent;
        border: 0.1rem solid ${isLightCoWAMM ? Color.cowammBlack : Color.darkBlue};
        color: ${isLightCoWAMM ? Color.cowammBlack : Color.darkBlue};};

        &:hover {
          color: ${isLightCoWAMM ? Color.cowammBlack : Color.darkBlue};};
        }
      `}

    ${Media.mediumDown} {
      margin: 0 2.4rem 0 auto;
      min-height: 3.2rem;
      border-radius: 1rem;
    }

    ${Media.mobile} {
      margin: 0 auto;
    }
  }

  > li:not(:last-of-type) {
    margin: 0 3.6rem 0 0;

    ${Media.mediumDown} {
      margin: 0 0 3.6rem;
      line-height: 1;
    }
  }

  > li {
    color: inherit;

    ${Media.mediumDown} {
      margin: 0 0 3.6rem;
      line-height: 1;
      width: 100%;
      text-align: center;
    }
  }

  > li > a {
    font-size: inherit;
    color: inherit;
    text-decoration: none;
    font-weight: ${Font.weightLight};

    &:hover {
      color: inherit;
      text-decoration: underline;
    }

    ${Media.mediumDown} {
      color: ${({ isLightCoWAMM }) => (isLightCoWAMM ? Color.cowammWhite : Color.lightBlue)};

      &:hover {
        color: ${({ isLightCoWAMM }) => (isLightCoWAMM ? Color.cowammWhite : Color.lightBlue)};
      }
    }
  }
`

const CloseIcon = styled.button`
  display: none;
  position: fixed;
  right: 1.6rem;
  top: 1.6rem;
  color: inherit;
  background: transparent;
  border: 0;
  opacity: 0.7;
  transition: opacity 0.2s ease-in-out;

  &:hover {
    opacity: 1;
  }

  &::before {
    content: '✕';
    display: block;
    font-size: 5rem;
    font-family: ${Font.arial};

    ${Media.mobile} {
      font-size: 3.2rem;
      color: inherit;
    }
  }

  ${Media.mediumDown} {
    display: flex;
  }
`

const MenuToggle = styled.button<{ isLight?: boolean; isLightCoWAMM?: boolean; isSticky?: boolean }>`
  display: none;
  background: transparent;
  flex-flow: row;
  align-items: center;
  justify-content: center;
  border-radius: ${Defaults.borderRadius};
  text-decoration: none;
  border: none;
  height: 4.2rem;
  width: 4.2rem;
  padding: 0;

  &::before {
    display: flex;
    content: '';
    background: url(${MenuImage}) no-repeat center/contain;
    ${({ isLight }) => !isLight && `background: url(${MenuImageLight}) no-repeat center/contain`};
    ${({ isLightCoWAMM }) =>
      isLightCoWAMM && `background: url(${MenuImageLightThemedCoWAMM}) no-repeat center/contain`};
    width: 62%;
    height: 100%;

    ${({ isSticky, isLightCoWAMM }) =>
      isSticky &&
      css`
        background: url(${MenuImage}) no-repeat center/contain;
        ${isLightCoWAMM && `background: url(${MenuImageThemedCoWAMM}) no-repeat center/contain`};
      `}
  }

  ${Media.mediumDown} {
    display: flex;
  }
`

const Logo = styled.div<{ isLight?: boolean; isLightCoWAMM?: boolean; menuVisible?: boolean; isSticky?: boolean }>`
  width: 12.2rem;
  height: 3.8rem;
  background: ${({ isLight, isLightCoWAMM }) =>
      `url(${isLightCoWAMM ? LogoLightImageThemedCoWAMM : !isLight ? LogoLightImage : LogoImage})`}
    no-repeat center/contain;
  cursor: pointer;
  z-index: 10;

  ${({ isSticky, isLightCoWAMM }) =>
    isSticky &&
    css`
      background: ${`url(${isLightCoWAMM ? LogoImageThemedCoWAMM : LogoImage})`} no-repeat center/contain;
    `}

  ${Media.mediumDown} {
    background: url(${LogoIconImage}) no-repeat center/contain;
    ${({ isLight, menuVisible }) =>
      (!isLight || menuVisible) && `background: url(${LogoIconLightImage}) no-repeat center/contain`};

    ${({ isLightCoWAMM, menuVisible }) =>
      (isLightCoWAMM || menuVisible) && `background: url(${LogoIconLightImageThemedCoWAMM}) no-repeat center/contain`};

    width: 3.6rem;
    height: 3.2rem;
    background-size: contain;
    background-position: left;

    ${({ isSticky, isLightCoWAMM, menuVisible }) =>
      isSticky &&
      css`
        width: 3.6rem;
        height: 3.2rem;
        background: url(${LogoIconImage}) no-repeat center/contain;
        ${(isLightCoWAMM || menuVisible) && `background: url(${LogoIconImageThemedCoWAMM}) no-repeat center/contain`};
      `}
  }
`

interface Props {
  isLight?: boolean
  isLightCoWAMM?: boolean
}

export default function Header({ isLight = false, isLightCoWAMM = false }: Props) {
  const swapURL = CONFIG.url.swap
  const isTouch = useMediaQuery(`(max-width: ${Media.mediumEnd})`)
  const [menuVisible, setIsMenuVisible] = useState(false)
  const toggleBodyScroll = () => {
    !menuVisible ? document.body.classList.add('noScroll') : document.body.classList.remove('noScroll')
  }
  const handleClick = ({ label }) => {
    // log GA event
    sendGAEventHandler({ category: GAEventCategories.NAVIGATION, action: `Header menu clicked: ${label}` })

    if (isTouch) {
      setIsMenuVisible(!menuVisible)
      toggleBodyScroll()
    }
  }

  return (
    <InView threshold={1} delay={500} initialInView>
      {({ inView, ref }) => (
        <>
          <Pixel ref={ref} />
          <Wrapper isSticky={!inView}>
            <Content>
              <Link passHref href="/">
                <Logo isLight={isLight} isLightCoWAMM={isLightCoWAMM} menuVisible={menuVisible} isSticky={!inView} />
              </Link>

              <Menu menuVisible={menuVisible} isLight={isLight} isLightCoWAMM={isLightCoWAMM} isSticky={!inView}>
                {HEADER_LINKS.map((link, index) => (
                  <li key={index}>
                    <CustomLink {...link} onClick={() => handleClick({ label: link.label })} />
                  </li>
                ))}
                <CloseIcon onClick={() => handleClick({ label: 'Close menu on touch/mobile' })} />
              </Menu>

              <LinkWithUtm
                defaultUtm={{
                  ...CONFIG.utm,
                  utmContent: 'header-cta-button',
                }}
                href={swapURL}
                passHref
              >
                <Button
                  onClick={() => sendGAEventHandler(NavigationEvents.TRADE_ON_COWSWAP)}
                  variant={
                    !inView && isLightCoWAMM
                      ? ButtonVariant.COWAMM_OUTLINE_SMALL
                      : !inView
                      ? ButtonVariant.SMALL
                      : isLightCoWAMM
                      ? ButtonVariant.COWAMM_OUTLINE_LIGHT
                      : ButtonVariant.OUTLINE
                  }
                  minHeight={4.8}
                  fontSize={1.6}
                  label={'Trade on CoW Swap'}
                  target="_blank"
                  rel="noopener nofollow"
                />
              </LinkWithUtm>
              <MenuToggle
                isLight={isLight}
                isLightCoWAMM={isLightCoWAMM}
                onClick={() => handleClick({ label: 'Open menu on touch/mobile' })}
                isSticky={!inView}
              />
            </Content>
          </Wrapper>
        </>
      )}
    </InView>
  )
}
