import { ProductLogo } from '@cowprotocol/ui'
import { MenuItem } from '@cowprotocol/ui'
import {
  FooterContainer,
  FooterContent,
  FooterLogo,
  FooterSection,
  Description,
  FooterIcons,
  SocialIconLink,
  SectionTitle,
  LinkListWrapper,
  LinkListGroup,
  LinkList,
  Link,
  FooterBottom,
  BottomText,
  FooterBottomLogos,
} from './styled'

import { FooterAnimation } from './footerAnimation'
import { ProductVariant, Color } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'

import IMG_ICON_SOCIAL_X from '@cowprotocol/assets/images/icon-social-x.svg'
import IMG_ICON_SOCIAL_DISCORD from '@cowprotocol/assets/images/icon-social-discord.svg'
import IMG_ICON_SOCIAL_GITHUB from '@cowprotocol/assets/images/icon-social-github.svg'
import IMG_ICON_SOCIAL_FORUM from '@cowprotocol/assets/images/icon-social-forum.svg'

interface FooterProps {
  description?: string
  navItems: MenuItem[]
  theme: 'light' | 'dark'
  productVariant: ProductVariant
}

const SOCIAL_LINKS: { href: string; label: string; icon: string }[] = [
  { href: 'https://x.com/CoWSwap', label: 'Twitter/X', icon: IMG_ICON_SOCIAL_X },
  { href: '#', label: 'Discord', icon: IMG_ICON_SOCIAL_DISCORD },
  { href: 'https://github.com/cowprotocol', label: 'GitHub', icon: IMG_ICON_SOCIAL_GITHUB },
  { href: 'https://forum.cow.fi/', label: 'Forum', icon: IMG_ICON_SOCIAL_FORUM },
]

const PRODUCT_LOGO_LINKS: { href: string; label: string; productVariant: ProductVariant }[] = [
  { href: 'https://swap.cow.fi/', label: 'CoW Swap', productVariant: 'cowSwap' },
  { href: 'https://cow.fi/', label: 'CoW Protocol', productVariant: 'cowProtocol' },
  { href: 'https://mevblocker.com', label: 'MEV Blocker', productVariant: 'mevBlocker' },
  { href: 'https://cow.fi/cow-amm', label: 'CoW AMM', productVariant: 'cowAmm' },
]

export const Footer = ({ description, navItems, theme, productVariant }: FooterProps) => {
  return (
    <FooterContainer theme={theme}>
      <FooterContent>
        <FooterSection>
          <FooterLogo>
            <ProductLogo variant={productVariant} theme={theme} logoIconOnly={false} />
          </FooterLogo>
          {description && <Description>{description}</Description>}
          <FooterIcons>
            {SOCIAL_LINKS.map((social, index) => (
              <SocialIconLink key={index} href={social.href} target="_blank" rel="noopener noreferrer">
                <SVG src={social.icon} title={social.label} />
              </SocialIconLink>
            ))}
          </FooterIcons>
        </FooterSection>

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

      <FooterBottom>
        <BottomText>&copy; CoW DAO - {new Date().getFullYear()}</BottomText>
        <FooterBottomLogos>
          {PRODUCT_LOGO_LINKS.map((product, index) => (
            <a key={index} href={product.href} target="_blank" rel="noopener noreferrer">
              <ProductLogo
                variant={product.productVariant}
                theme={theme}
                logoIconOnly={false}
                overrideColor={Color(theme).neutral50}
                height={20}
              />
            </a>
          ))}
        </FooterBottomLogos>
      </FooterBottom>
    </FooterContainer>
  )
}
