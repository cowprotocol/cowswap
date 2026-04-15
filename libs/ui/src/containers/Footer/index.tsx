import { ReactNode, useRef, useState } from 'react'

import { Category, toGtmEvent } from '@cowprotocol/analytics'
import IMG_ICON_ARROW_RIGHT_CIRCULAR from '@cowprotocol/assets/images/arrow-right-circular.svg'
import IMG_ICON_SOCIAL_DISCORD from '@cowprotocol/assets/images/icon-social-discord.svg'
import IMG_ICON_SOCIAL_FORUM from '@cowprotocol/assets/images/icon-social-forum.svg'
import IMG_ICON_SOCIAL_GITHUB from '@cowprotocol/assets/images/icon-social-github.svg'
import IMG_ICON_SOCIAL_SNAPSHOT from '@cowprotocol/assets/images/icon-social-snapshot.svg'
import IMG_ICON_SOCIAL_X from '@cowprotocol/assets/images/icon-social-x.svg'
import { useTheme } from '@cowprotocol/common-hooks'

import SVG from 'react-inlinesvg'

import { FooterAnimation } from './footerAnimation'
import {
  BottomRight,
  BottomText,
  Description,
  FooterBottom,
  FooterBottomLogos,
  FooterContainer,
  FooterContent,
  FooterDescriptionSection,
  FooterLogo,
  Link,
  LinkList,
  LinkListGroup,
  LinkListWrapper,
  SectionTitle,
  SocialIconLink,
  SocialIconsWrapper,
  ToggleFooterButton,
} from './styled'

import { UI } from '../../enum'
import { MenuItem } from '../../pure/MenuBar'
import { ProductLogo, ProductVariant } from '../../pure/ProductLogo'

interface NavItemProps extends Omit<MenuItem, 'label' | 'badge'> {
  label?: string
  badge?: string
}

export interface FooterProps {
  description?: string
  navItems?: Array<NavItemProps>
  productVariant: ProductVariant
  additionalFooterContent?: ReactNode
  expanded?: boolean
  hasTouchFooter?: boolean
  maxWidth?: number
  host?: string
}

const SOCIAL_LINKS: { href: string; label: string; icon: string; external: boolean; utmContent: string }[] = [
  {
    href: 'https://x.com/CoWSwap',
    label: 'Twitter/X',
    icon: IMG_ICON_SOCIAL_X,
    external: true,
    utmContent: 'social-twitter',
  },
  {
    href: 'https://discord.com/invite/cowprotocol',
    label: 'Discord',
    icon: IMG_ICON_SOCIAL_DISCORD,
    external: true,
    utmContent: 'social-discord',
  },
  {
    href: 'https://github.com/cowprotocol',
    label: 'GitHub',
    icon: IMG_ICON_SOCIAL_GITHUB,
    external: true,
    utmContent: 'social-github',
  },
  {
    href: 'https://forum.cow.finance/',
    label: 'Forum',
    icon: IMG_ICON_SOCIAL_FORUM,
    external: true,
    utmContent: 'social-forum',
  },
  {
    href: 'https://snapshot.org/#/cow.eth',
    label: 'Snapshot',
    icon: IMG_ICON_SOCIAL_SNAPSHOT,
    external: true,
    utmContent: 'social-snapshot',
  },
]

const PRODUCT_LOGO_LINKS: {
  href: string
  label: string
  productVariant: ProductVariant
  external: boolean
  utmContent: string
}[] = [
  {
    href: 'https://swap.cow.finance/',
    label: 'CoW Swap',
    productVariant: ProductVariant.CowSwap,
    external: true,
    utmContent: 'product-cow-swap',
  },
  {
    href: 'https://cow.finance/',
    label: 'CoW Protocol',
    productVariant: ProductVariant.CowProtocol,
    external: true,
    utmContent: 'product-cow-protocol',
  },
  {
    href: 'https://cow.finance/mev-blocker',
    label: 'MEV Blocker',
    productVariant: ProductVariant.MevBlocker,
    external: true,
    utmContent: 'product-mev-blocker',
  },
  {
    href: 'https://cow.finance/cow-amm',
    label: 'CoW AMM',
    productVariant: ProductVariant.CowAmm,
    external: true,
    utmContent: 'product-cow-amm',
  },
]

const GLOBAL_FOOTER_DESCRIPTION =
  'CoW DAO is an open collective of developers, market makers, and community contributors on a mission to protect users from the dangers of DeFi.'

const FOOTER_NAV_GROUP_PRODUCTS: NavItemProps = {
  label: 'Products',
  children: [
    {
      label: 'CoW Swap',
      href: 'https://cow.finance/cow-swap',
      external: true,
      utmContent: 'footer-products-cow-swap',
    },
    {
      label: 'CoW Protocol',
      href: 'https://cow.finance/cow-protocol',
      external: true,
      utmContent: 'footer-products-cow-protocol',
    },
    { label: 'CoW AMM', href: 'https://cow.finance/cow-amm', external: true, utmContent: 'footer-products-cow-amm' },
    {
      label: 'MEV Blocker',
      href: 'https://cow.finance/mev-blocker',
      external: true,
      utmContent: 'footer-products-mev-blocker',
    },
    {
      label: 'CoW Explorer',
      href: 'https://explorer.cow.finance/',
      external: true,
      utmContent: 'footer-products-cow-explorer',
    },
    {
      label: 'CoW Widget',
      href: 'https://cow.finance/widget',
      external: true,
      utmContent: 'footer-products-cow-widget',
    },
  ],
}

const FOOTER_NAV_GROUP_HELP: NavItemProps = {
  label: 'Help',
  children: [
    { label: 'Docs', href: 'https://docs.cow.finance/', external: true, utmContent: 'footer-help-docs' },
    {
      label: 'Knowledge Base',
      href: 'https://cow.finance/learn',
      external: true,
      utmContent: 'footer-help-knowledge-base',
    },
    {
      label: 'Report Scams',
      href: 'https://cow.finance/report-scam',
      external: true,
      utmContent: 'footer-help-report-scams',
    },
  ],
}

const FOOTER_NAV_GROUP_MISC: NavItemProps = {
  label: 'Misc.',
  children: [
    { label: 'For DAOs', href: 'https://cow.finance/daos', external: true, utmContent: 'footer-misc-for-daos' },
    {
      label: 'Token Charts',
      href: 'https://cow.finance/tokens',
      external: true,
      utmContent: 'footer-misc-token-charts',
    },
  ],
}

function getAboutFooterNavChildren(isAffiliateProgramEnabled: boolean): NonNullable<MenuItem['children']> {
  return [
    {
      href: 'https://docs.cow.finance/governance',
      label: 'Governance',
      external: true,
      utmContent: 'footer-about-governance',
    },
    {
      href: 'https://dune.com/cowprotocol/cow-revenue',
      label: 'Revenue',
      external: true,
      utmContent: 'footer-about-revenue',
    },
    { href: 'https://grants.cow.finance/', label: 'Grants', external: true, utmContent: 'footer-about-grants' },
    { href: 'https://cow.finance/careers', label: 'Careers', external: true, utmContent: 'footer-about-careers' },
    {
      href: 'https://cownation.notion.site/CoW-DAO-Brand-Kit-dad6212f182f49d38683e8410bfb37d2',
      label: 'Brand Kit',
      external: true,
      utmContent: 'footer-about-brand-kit',
    },
    { href: 'https://cow.finance/legal', label: 'Legal', external: true, utmContent: 'footer-about-legal' },
    {
      label: 'Bug Bounty',
      href: 'https://immunefi.com/bug-bounty/cowprotocol/information/',
      external: true,
      utmContent: 'footer-misc-bug-bounty',
    },
    ...(isAffiliateProgramEnabled
      ? [
          {
            label: 'Affiliate Program',
            href: '/affiliate-program',
            utmContent: 'footer-about-affiliate-program',
          },
        ]
      : []),
  ]
}

export function getGlobalFooterNavItems(isAffiliateProgramEnabled: boolean): Array<NavItemProps> {
  return [
    { label: 'About', children: getAboutFooterNavChildren(isAffiliateProgramEnabled) },
    FOOTER_NAV_GROUP_PRODUCTS,
    FOOTER_NAV_GROUP_HELP,
    FOOTER_NAV_GROUP_MISC,
  ]
}

interface FooterLinkProps {
  href: string
  external?: boolean
  label?: string
  utmSource?: string
  utmContent?: string
  rootDomain?: string
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const FooterLink = ({ href, external, label, utmSource: _utmSource, utmContent, rootDomain }: FooterLinkProps) => {
  const finalRootDomain = rootDomain || (typeof window !== 'undefined' ? window.location.host : '')

  const finalHref = external
    ? href
    : (() => {
        try {
          return `${new URL(href, `https://${finalRootDomain}`).pathname}`
        } catch {
          return href.startsWith('/') ? href : `/${href}`
        }
      })()

  return (
    <Link
      href={finalHref}
      target={external ? '_blank' : '_self'}
      rel={external ? 'noopener noreferrer' : undefined}
      data-click-event={toGtmEvent({
        category: Category.FOOTER,
        action: 'click',
        label: utmContent || label?.toLowerCase().replace(/\s+/g, '-'),
      })}
    >
      {label}
    </Link>
  )
}

export const GLOBAL_FOOTER_NAV_ITEMS = getGlobalFooterNavItems(false)

export const Footer = ({
  description = GLOBAL_FOOTER_DESCRIPTION,
  navItems = GLOBAL_FOOTER_NAV_ITEMS,
  additionalFooterContent,
  expanded = false,
  hasTouchFooter = false,
  maxWidth,
  host,
  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
}: FooterProps) => {
  const [isFooterExpanded, setIsFooterExpanded] = useState(expanded)
  const footerRef = useRef<HTMLDivElement>(null)
  const theme = useTheme()

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const toggleFooter = () => {
    setIsFooterExpanded((state) => {
      if (!state && footerRef.current) {
        setTimeout(() => {
          footerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
        }, 300) // Slight delay needed for correct scroll position calculation
      }

      return !state
    })
  }

  return (
    <FooterContainer ref={footerRef} expanded={isFooterExpanded} hasTouchFooter={hasTouchFooter}>
      {isFooterExpanded && (
        <>
          <FooterContent maxWidth={maxWidth}>
            <FooterDescriptionSection>
              <FooterLogo>
                <ProductLogo
                  variant={ProductVariant.CowDao}
                  height={32}
                  overrideColor={!theme.darkMode ? `var(${UI.COLOR_NEUTRAL_100})` : `var(${UI.COLOR_NEUTRAL_90})`}
                  overrideHoverColor={!theme.darkMode ? `var(${UI.COLOR_NEUTRAL_98})` : `var(${UI.COLOR_NEUTRAL_95})`}
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
                        <FooterLink
                          href={child.href || '#'}
                          external={child.external}
                          label={child.label as string}
                          utmSource={child.utmSource}
                          utmContent={child.utmContent}
                          rootDomain={host || window.location.host}
                        />
                      </li>
                    ))}
                  </LinkList>
                </LinkListGroup>
              ))}
            </LinkListWrapper>
          </FooterContent>

          <FooterAnimation />
        </>
      )}
      <FooterBottom maxWidth={maxWidth}>
        <BottomText>&copy; CoW DAO - {new Date().getFullYear()}</BottomText>
        <FooterBottomLogos>
          {PRODUCT_LOGO_LINKS.map((product, index) => (
            <ProductLogo
              key={index}
              variant={product.productVariant}
              logoIconOnly={false}
              overrideColor={!theme.darkMode ? `var(${UI.COLOR_NEUTRAL_40})` : `var(${UI.COLOR_NEUTRAL_40})`}
              overrideHoverColor={`var(${UI.COLOR_NEUTRAL_98})`}
              height={24}
              href={product.href}
              external={true}
              aria-label={`Visit the ${product.label} website`}
            />
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
