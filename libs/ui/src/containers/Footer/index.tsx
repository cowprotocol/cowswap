import { ReactNode, useRef, useState } from 'react'

import { Category, toGtmEvent } from '@cowprotocol/analytics'
import svgArrowRightCircularSrc from '@cowprotocol/assets/images/arrow-right-circular.svg'
import { useTheme } from '@cowprotocol/common-hooks'

import SVG from 'react-inlinesvg'

import {
  getGlobalFooterNavItems,
  GLOBAL_FOOTER_DESCRIPTION,
  SOCIAL_LINKS,
  PRODUCT_LOGO_LINKS,
} from './footer.constants'
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

export interface NavItemProps extends Omit<MenuItem, 'label' | 'badge'> {
  label?: string
  badge?: string
}

export interface FooterProps {
  description?: string
  navItems?: NavItemProps[]
  productVariant: ProductVariant
  additionalFooterContent?: ReactNode
  expanded?: boolean
  hasTouchFooter?: boolean
  maxWidth?: number
  host?: string
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
            <SVG src={svgArrowRightCircularSrc} title="Toggle Footer" />
          </ToggleFooterButton>
        </BottomRight>
      </FooterBottom>
    </FooterContainer>
  )
}
