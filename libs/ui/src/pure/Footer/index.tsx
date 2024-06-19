import { useState, ReactNode, useEffect, useRef } from 'react'

import IMG_ICON_ARROW_RIGHT_CIRCULAR from '@cowprotocol/assets/images/arrow-right-circular.svg'
import IMG_ICON_SOCIAL_DISCORD from '@cowprotocol/assets/images/icon-social-discord.svg'
import IMG_ICON_SOCIAL_FORUM from '@cowprotocol/assets/images/icon-social-forum.svg'
import IMG_ICON_SOCIAL_GITHUB from '@cowprotocol/assets/images/icon-social-github.svg'
import IMG_ICON_SOCIAL_SNAPSHOT from '@cowprotocol/assets/images/icon-social-snapshot.svg'
import IMG_ICON_SOCIAL_X from '@cowprotocol/assets/images/icon-social-x.svg'

import SVG from 'react-inlinesvg'
import { ThemeProvider } from 'styled-components/macro'

import { FooterAnimation } from './footerAnimation'
import {
  FooterContainer,
  FooterContent,
  FooterLogo,
  FooterDescriptionSection,
  Description,
  SocialIconsWrapper,
  SocialIconLink,
  SectionTitle,
  LinkListWrapper,
  LinkListGroup,
  LinkList,
  Link,
  FooterBottom,
  BottomText,
  FooterBottomLogos,
  BottomRight,
  ToggleFooterButton,
} from './styled'

import { Color, themeMapper } from '../../consts'
import { MenuItem } from '../MenuBar'
import { ProductLogo, ProductVariant } from '../ProductLogo'

interface FooterProps {
  description?: string
  navItems?: MenuItem[]
  theme: 'light' | 'dark'
  productVariant: ProductVariant
  additionalFooterContent?: ReactNode
  expanded?: boolean
  hasTouchFooter?: boolean
  maxWidth?: number
}

const SOCIAL_LINKS: { href: string; label: string; icon: string }[] = [
  { href: 'https://x.com/CoWSwap', label: 'Twitter/X', icon: IMG_ICON_SOCIAL_X },
  { href: 'https://discord.com/invite/cowprotocol', label: 'Discord', icon: IMG_ICON_SOCIAL_DISCORD },
  { href: 'https://github.com/cowprotocol', label: 'GitHub', icon: IMG_ICON_SOCIAL_GITHUB },
  { href: 'https://forum.cow.fi/', label: 'Forum', icon: IMG_ICON_SOCIAL_FORUM },
  { href: 'https://snapshot.org/#/cow.eth', label: 'Snapshot', icon: IMG_ICON_SOCIAL_SNAPSHOT },
]

const PRODUCT_LOGO_LINKS: { href: string; label: string; productVariant: ProductVariant }[] = [
  {
    href: 'https://swap.cow.fi/',
    label: 'CoW Swap',
    productVariant: ProductVariant.CowSwap,
  },
  { href: 'https://cow.fi/', label: 'CoW Protocol', productVariant: ProductVariant.CowProtocol },
  { href: 'https://mevblocker.com', label: 'MEV Blocker', productVariant: ProductVariant.MevBlocker },
  { href: 'https://cow.fi/cow-amm', label: 'CoW AMM', productVariant: ProductVariant.CowAmm },
]

const GLOBAL_FOOTER_DESCRIPTION =
  'CoW DAO is an open organization of developers, market makers, and community contributors on a mission to protect users from the dangers of DeFi.'

const GLOBAL_FOOTER_NAV_ITEMS: MenuItem[] = [
  {
    label: 'About',
    children: [
      { href: '#', label: 'Governance' },
      { href: '#', label: 'Token' },
      { href: '#', label: 'Grants' },
      { href: '#', label: 'Careers' },
      { href: '#', label: 'Brand Kit' },
    ],
  },
  {
    label: 'Legal',
    children: [
      { href: '#', label: 'Terms & Conditions' },
      { href: '#', label: 'Cookie Policy' },
      { href: '#', label: 'Privacy Policy' },
    ],
  },
  {
    label: 'Products',
    children: [
      { href: '#', label: 'CoW Swap' },
      { href: '#', label: 'CoW Protocol' },
      { href: '#', label: 'CoW AMM' },
      { href: '#', label: 'MEV Blocker' },
      { href: '#', label: 'Explorer' },
      { href: '#', label: 'Widget' },
      { href: '#', label: 'Hooks Store' },
    ],
  },
  {
    href: '#',
    label: 'Help',
    children: [
      { href: '#', label: 'Dev Docs' },
      { href: 'https://cow.fi/learn', label: 'FAQ / Knowledge Base' },
      { href: '#', label: 'Send Feedback' },
      { href: '#', label: 'Report Scams' },
    ],
  },
  {
    label: 'Misc.',
    children: [
      { href: 'https://cow.fi/tokens', label: 'Tokens' },
      { href: '#', label: 'Swag Store' },
      { href: '#', label: 'Token Charts' },
      { href: '#', label: 'For DAOs' },
    ],
  },
]

export const Footer = ({
  description = GLOBAL_FOOTER_DESCRIPTION,
  navItems = GLOBAL_FOOTER_NAV_ITEMS,
  theme,
  additionalFooterContent,
  expanded = false,
  hasTouchFooter = false,
  maxWidth,
}: FooterProps) => {
  const [isFooterExpanded, setIsFooterExpanded] = useState(expanded)
  const footerRef = useRef<HTMLDivElement>(null)
  const hasMounted = useRef(false)

  const toggleFooter = () => {
    setIsFooterExpanded(!isFooterExpanded)
  }

  useEffect(() => {
    if (hasMounted.current) {
      if (isFooterExpanded && footerRef.current) {
        setTimeout(() => {
          footerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
        }, 300) // Slight delay needed for correct scroll position calculation
      }
    } else {
      hasMounted.current = true
    }
  }, [isFooterExpanded])

  return (
    <ThemeProvider theme={themeMapper(theme)}>
      <FooterContainer ref={footerRef} theme={theme as any} expanded={isFooterExpanded} hasTouchFooter={hasTouchFooter}>
        {isFooterExpanded && (
          <>
            <FooterContent maxWidth={maxWidth}>
              <FooterDescriptionSection>
                <FooterLogo>
                  <ProductLogo
                    variant={ProductVariant.CowDao}
                    theme={theme}
                    height={32}
                    overrideColor={theme === 'light' ? Color.neutral100 : Color.neutral90}
                    overrideHoverColor={theme === 'light' ? Color.neutral98 : Color.neutral95}
                  />
                </FooterLogo>
                {description && <Description>{description}</Description>}
                <SocialIconsWrapper>
                  {SOCIAL_LINKS.map((social, index) => (
                    <SocialIconLink key={index} href={social.href} target="_blank" rel="noopener noreferrer">
                      <SVG src={social.icon} title={social.label} />
                    </SocialIconLink>
                  ))}
                </SocialIconsWrapper>
              </FooterDescriptionSection>

              <LinkListWrapper>
                {navItems.map((item, index) => (
                  <LinkListGroup key={index}>
                    <SectionTitle>{item.label}</SectionTitle>
                    <LinkList>
                      {item.children?.map((child, childIndex) => (
                        <li key={childIndex}>
                          <Link href={child.href || '#'}>{child.label}</Link>
                        </li>
                      ))}
                    </LinkList>
                  </LinkListGroup>
                ))}
              </LinkListWrapper>
            </FooterContent>

            <FooterAnimation theme={theme} />
          </>
        )}
        <FooterBottom maxWidth={maxWidth}>
          <BottomText>&copy; CoW DAO - {new Date().getFullYear()}</BottomText>
          <FooterBottomLogos>
            {PRODUCT_LOGO_LINKS.map((product, index) => (
              <a key={index} href={product.href}>
                <ProductLogo
                  variant={product.productVariant}
                  theme={theme}
                  logoIconOnly={false}
                  overrideColor={theme === 'light' ? Color.neutral40 : Color.neutral40}
                  overrideHoverColor={Color.neutral98}
                  height={24}
                />
              </a>
            ))}
          </FooterBottomLogos>

          <BottomRight>
            {additionalFooterContent && additionalFooterContent}
            <ToggleFooterButton onClick={toggleFooter} expanded={isFooterExpanded}>
              <SVG src={IMG_ICON_ARROW_RIGHT_CIRCULAR} title="Toggle Footer" />
            </ToggleFooterButton>
          </BottomRight>
        </FooterBottom>
      </FooterContainer>
    </ThemeProvider>
  )
}