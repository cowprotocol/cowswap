// eslint-disable-next-line no-restricted-imports
import { t /*, Trans*/ } from '@lingui/macro'
// import { PrivacyPolicyModal } from 'components/PrivacyPolicy'
// import { L2_CHAIN_IDS } from 'constants/chains'
// import { LOCALE_LABEL, SUPPORTED_LOCALES, SupportedLocale } from 'constants/locales'
// import { useActiveLocale } from 'hooks/useActiveLocale'
// import useActiveWeb3React from 'hooks/useActiveWeb3React'
// import { useLocationLinkProps } from 'hooks/useLocationLinkProps'
import React, { /*useEffect,*/ useRef /*, useState*/ } from 'react'
// import {
//   BookOpen,
//   Check,
//   ChevronLeft,
//   Coffee,
//   FileText,
//   Globe,
//   HelpCircle,
//   Info,
//   MessageCircle,
//   Moon,
//   Sun,
// } from 'react-feather'
import { Link } from 'react-router-dom'
// import { useDarkModeManager } from 'state/user/hooks'
import styled, { css } from 'styled-components/macro'

import { ReactComponent as MenuIcon } from 'assets/images/menu.svg'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import { useModalOpen, useToggleModal } from 'state/application/hooks'
import { ApplicationModal } from 'state/application/reducer'
import { ExternalLink } from 'theme'
import { ButtonPrimary } from 'components/Button'

// MOD imports
import { WithClassName } from 'types'

export enum FlyoutAlignment {
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

const StyledMenuIcon = styled(MenuIcon)`
  path {
    stroke: ${({ theme }) => theme.text1};
  }
`

export const StyledMenuButton = styled.button`
  width: 100%;
  //height: 100%;
  border: none;
  //background-color: transparent;
  margin: 0;
  //padding: 0;
  height: 35px;
  background-color: ${({ theme }) => theme.bg3};
  //border: 1px solid ${({ theme }) => theme.bg0};
  padding: 0.15rem 0.5rem;
  border-radius: 0.5rem;

  :hover,
  :focus {
    cursor: pointer;
    outline: none;
    background-color: ${({ theme }) => theme.bg4};
  }

  svg {
    margin-top: 2px;
  }
`

export const UNIbutton = styled(ButtonPrimary)`
  background-color: ${({ theme }) => theme.bg3};
  background: radial-gradient(174.47% 188.91% at 1.84% 0%, #ff007a 0%, #2172e5 100%), #edeef2;
  border: none;
`

export const StyledMenu = styled.div`
  margin-left: 0.5rem; // mod
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: none;
  text-align: left;
`

export const MenuFlyout = styled.span<{ flyoutAlignment?: FlyoutAlignment }>`
  min-width: 8.125rem;
  background-color: ${({ theme }) => theme.bg3};
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);
  border-radius: 12px;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  font-size: 1rem;
  position: absolute;
  top: 3rem;
  right: 0rem;
  z-index: 100;

  ${({ flyoutAlignment = FlyoutAlignment.RIGHT }) =>
    flyoutAlignment === FlyoutAlignment.RIGHT
      ? css`
          right: 0rem;
        `
      : css`
          left: 0rem;
        `};
  ${({ theme }) => theme.mediaWidth.upToMedium`
    top: -17.25rem;
  `};
`

export const MenuItemBase = css`
  display: flex;
  flex: 1;
  flex-direction: row;
  align-items: center;
  padding: 0.5rem 0.5rem;
  //justify-content: space-between;
  color: ${({ theme }) => theme.text2};
  :hover {
    color: ${({ theme }) => theme.text1};
    cursor: pointer;
    text-decoration: none;
  }
  > svg {
    margin-right: 8px;
  }
`

export const MenuItem = styled(ExternalLink)`
  ${MenuItemBase}
`

export const InternalMenuItem = styled(Link)`
  flex: 1;
  padding: 0.5rem 0.5rem;
  color: ${({ theme }) => theme.text2};
  font-weight: 500; // mod
  :hover {
    color: ${({ theme }) => theme.text1};
    cursor: pointer;
    text-decoration: none;
  }
  > svg {
    margin-right: 8px;
  }
`

/* const InternalLinkMenuItem = styled(InternalMenuItem)`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0.5rem 0.5rem;
  justify-content: space-between;
  text-decoration: none;
  :hover {
    color: ${({ theme }) => theme.text1};
    cursor: pointer;
    text-decoration: none;
  }
`

const ToggleMenuItem = styled.button`
  background-color: transparent;
  margin: 0;
  padding: 0;
  border: none;
  display: flex;
  flex: 1;
  flex-direction: row;
  align-items: center;
  padding: 0.5rem 0.5rem;
  justify-content: space-between;
  font-size: 1rem;
  font-weight: 500;
  color: ${({ theme }) => theme.text2};
  :hover {
    color: ${({ theme }) => theme.text1};
    cursor: pointer;
    text-decoration: none;
  }
`

function LanguageMenuItem({ locale, active, key }: { locale: SupportedLocale; active: boolean; key: string }) {
  const { to, onClick } = useLocationLinkProps(locale)

  if (!to) return null

  return (
    <InternalLinkMenuItem onClick={onClick} key={key} to={to}>
      <div>{LOCALE_LABEL[locale]}</div>
      {active && <Check opacity={0.6} size={16} />}
    </InternalLinkMenuItem>
  )
}

function LanguageMenu({ close }: { close: () => void }) {
  const activeLocale = useActiveLocale()

  return (
    <MenuFlyout>
      <ToggleMenuItem onClick={close}>
        <ChevronLeft size={16} />
      </ToggleMenuItem>
      {SUPPORTED_LOCALES.map((locale) => (
        <LanguageMenuItem locale={locale} active={activeLocale === locale} key={locale} />
      ))}
    </MenuFlyout>
  )
} */

export default function Menu(props: { children?: React.ReactNode } & WithClassName) {
  // const { account, chainId } = useActiveWeb3React()

  const node = useRef<HTMLDivElement>()
  const open = useModalOpen(ApplicationModal.MENU)
  const toggleMenu = useToggleModal(ApplicationModal.MENU)
  useOnClickOutside(node, open ? toggleMenu : undefined)
  /* const togglePrivacyPolicy = useToggleModal(ApplicationModal.PRIVACY_POLICY)
  const openClaimModal = useToggleModal(ApplicationModal.ADDRESS_CLAIM)
  const showUNIClaimOption = Boolean(!!account && !!chainId && !L2_CHAIN_IDS.includes(chainId))
  const { infoLink } = CHAIN_INFO[chainId ? chainId : SupportedChainId.MAINNET]

  const [darkMode, toggleDarkMode] = useDarkModeManager()

  const [menu, setMenu] = useState<'main' | 'lang'>('main')

  useEffect(() => {
    setMenu('main')
  }, [open])
 */
  return (
    <>
      {/* // https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30451 */}
      <StyledMenu ref={node as any} className={props?.className}>
        <StyledMenuButton onClick={toggleMenu} aria-label={t`Menu`}>
          <StyledMenuIcon />
        </StyledMenuButton>

        {open &&
          /* (() => {
            switch (menu) {
              case 'lang':
                return <LanguageMenu close={() => setMenu('main')} />
              case 'main':
              default:
                return (
                  <MenuFlyout>
                    <MenuItem href="https://uniswap.org/">
                      <div>
                        <Trans>About</Trans>
                      </div>
                      <Info opacity={0.6} size={16} />
                    </MenuItem>
                    <MenuItem href="https://help.uniswap.org/">
                      <div>
                        <Trans>Help Center</Trans>
                      </div>
                      <HelpCircle opacity={0.6} size={16} />
                    </MenuItem>
                    <MenuItem href="https://uniswap.canny.io/feature-requests">
                      <div>
                        <Trans>Request Features</Trans>
                      </div>
                      <Coffee opacity={0.6} size={16} />
                    </MenuItem>
                    <MenuItem href="https://discord.gg/FCfyBSbCU5">
                      <div>
                        <Trans>Discord</Trans>
                      </div>
                      <MessageCircle opacity={0.6} size={16} />
                    </MenuItem>
                    <ToggleMenuItem onClick={() => setMenu('lang')}>
                      <div>
                        <Trans>Language</Trans>
                      </div>
                      <Globe opacity={0.6} size={16} />
                    </ToggleMenuItem>
                    <ToggleMenuItem onClick={() => toggleDarkMode()}>
                      <div>{darkMode ? <Trans>Light Theme</Trans> : <Trans>Dark Theme</Trans>}</div>
                      {darkMode ? <Moon opacity={0.6} size={16} /> : <Sun opacity={0.6} size={16} />}
                    </ToggleMenuItem>
                    <MenuItem href="https://docs.uniswap.org/">
                      <div>
                        <Trans>Docs</Trans>
                      </div>
                      <BookOpen opacity={0.6} size={16} />
                    </MenuItem>
                    <ToggleMenuItem onClick={() => togglePrivacyPolicy()}>
                      <div>
                        <Trans>Legal & Privacy</Trans>
                      </div>
                      <FileText opacity={0.6} size={16} />
                    </ToggleMenuItem>
                    {showUNIClaimOption && (
                      <UNIbutton
                        onClick={openClaimModal}
                        padding="8px 16px"
                        width="100%"
                        $borderRadius="12px"
                        mt="0.5rem"
                      >
                        <Trans>Claim UNI</Trans>
                      </UNIbutton>
                    )}
                  </MenuFlyout>
                )
            }
          })()} */
          props?.children}
      </StyledMenu>
      {/* <PrivacyPolicyModal />  */}
    </>
  )
}

interface NewMenuProps {
  flyoutAlignment?: FlyoutAlignment
  ToggleUI?: React.FunctionComponent
  menuItems: {
    content: any
    link: string
    external: boolean
  }[]
}

const NewMenuFlyout = styled(MenuFlyout)`
  top: 3rem !important;
`
const NewMenuItem = styled(InternalMenuItem)`
  width: max-content;
  text-decoration: none;
`

const ExternalMenuItem = styled(MenuItem)`
  width: max-content;
  text-decoration: none;
`

export const NewMenu = ({ flyoutAlignment = FlyoutAlignment.RIGHT, ToggleUI, menuItems, ...rest }: NewMenuProps) => {
  const node = useRef<HTMLDivElement>()
  const open = useModalOpen(ApplicationModal.POOL_OVERVIEW_OPTIONS)
  const toggle = useToggleModal(ApplicationModal.POOL_OVERVIEW_OPTIONS)
  useOnClickOutside(node, open ? toggle : undefined)
  const ToggleElement = ToggleUI || StyledMenuIcon
  return (
    <StyledMenu ref={node as any} {...rest}>
      <ToggleElement onClick={toggle} />
      {open && (
        <NewMenuFlyout flyoutAlignment={flyoutAlignment}>
          {menuItems.map(({ content, link, external }, i) =>
            external ? (
              <ExternalMenuItem id="link" href={link} key={link + i}>
                {content}
              </ExternalMenuItem>
            ) : (
              <NewMenuItem id="link" to={link} key={link + i}>
                {content}
              </NewMenuItem>
            )
          )}
        </NewMenuFlyout>
      )}
    </StyledMenu>
  )
}
