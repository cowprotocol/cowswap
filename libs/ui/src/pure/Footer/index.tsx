import { useState, ReactNode, useEffect } from 'react'
import { ProductLogo } from '@cowprotocol/ui'
import { MenuItem } from '@cowprotocol/ui'
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

import { FooterAnimation } from './footerAnimation'
import { ProductVariant, Color } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'

import IMG_ICON_SOCIAL_X from '@cowprotocol/assets/images/icon-social-x.svg'
import IMG_ICON_SOCIAL_DISCORD from '@cowprotocol/assets/images/icon-social-discord.svg'
import IMG_ICON_SOCIAL_GITHUB from '@cowprotocol/assets/images/icon-social-github.svg'
import IMG_ICON_SOCIAL_FORUM from '@cowprotocol/assets/images/icon-social-forum.svg'
import IMG_ICON_SOCIAL_SNAPSHOT from '@cowprotocol/assets/images/icon-social-snapshot.svg'

import IMG_ICON_ARROW_RIGHT_CIRCULAR from '@cowprotocol/assets/images/arrow-right-circular.svg'

interface FooterProps {
  description?: string
  navItems: MenuItem[]
  theme: 'light' | 'dark'
  productVariant: ProductVariant
  additionalFooterContent?: ReactNode
  expanded?: boolean
}

const SOCIAL_LINKS: { href: string; label: string; icon: string }[] = [
  { href: 'https://x.com/CoWSwap', label: 'Twitter/X', icon: IMG_ICON_SOCIAL_X },
  { href: '#', label: 'Discord', icon: IMG_ICON_SOCIAL_DISCORD },
  { href: 'https://github.com/cowprotocol', label: 'GitHub', icon: IMG_ICON_SOCIAL_GITHUB },
  { href: 'https://forum.cow.fi/', label: 'Forum', icon: IMG_ICON_SOCIAL_FORUM },
  { href: 'https://snapshot.org/#/cow.eth', label: 'Snapshot', icon: IMG_ICON_SOCIAL_SNAPSHOT },
]

const PRODUCT_LOGO_LINKS: { href: string; label: string; productVariant: ProductVariant }[] = [
  { href: 'https://swap.cow.fi/', label: 'CoW Swap', productVariant: ProductVariant.CowSwap },
  { href: 'https://cow.fi/', label: 'CoW Protocol', productVariant: ProductVariant.CowProtocol },
  { href: 'https://mevblocker.com', label: 'MEV Blocker', productVariant: ProductVariant.MevBlocker },
  { href: 'https://cow.fi/cow-amm', label: 'CoW AMM', productVariant: ProductVariant.CowAmm },
]

export const Footer = ({ description, navItems, theme, additionalFooterContent, expanded = false }: FooterProps) => {
  const [isFooterExpanded, setIsFooterExpanded] = useState(expanded)

  const toggleFooter = () => {
    setIsFooterExpanded(!isFooterExpanded)
  }

  return (
    <FooterContainer theme={theme} expanded={isFooterExpanded}>
      {isFooterExpanded && (
        <>
          <FooterContent>
            <FooterDescriptionSection>
              <FooterLogo>
                <ProductLogo
                  variant={ProductVariant.CowDao}
                  theme={theme}
                  height={32}
                  overrideColor={Color.neutral100}
                  overrideHoverColor={Color.neutral80}
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
                        <Link href={child.href || '#'} target="_blank" rel="noopener noreferrer">
                          {child.label}
                        </Link>
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

      <FooterBottom>
        <BottomText>&copy; CoW DAO – {new Date().getFullYear()}</BottomText>
        <FooterBottomLogos>
          {PRODUCT_LOGO_LINKS.map((product, index) => (
            <a key={index} href={product.href} target="_blank" rel="noopener noreferrer">
              <ProductLogo
                variant={product.productVariant}
                theme={theme}
                logoIconOnly={false}
                overrideColor={Color.neutral50}
                overrideHoverColor={Color.neutral98}
                height={20}
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
  )
}
