import iconSocialDiscordSrc from '@cowprotocol/assets/images/icon-social-discord.svg'
import iconSocialForumSrc from '@cowprotocol/assets/images/icon-social-forum.svg'
import iconSocialGithubSrc from '@cowprotocol/assets/images/icon-social-github.svg'
import iconSocialSnapshotSrc from '@cowprotocol/assets/images/icon-social-snapshot.svg'
import iconSocialXSrc from '@cowprotocol/assets/images/icon-social-x.svg'
import {
  COW_DAO_DESCRIPTION,
  COW_FOOTER_ABOUT_LINKS,
  COW_FOOTER_NAV_GROUPS,
  COW_PRODUCT_LINKS,
  COW_SOCIAL_LINKS,
  type CowLink,
  type CowSocialId,
} from '@cowprotocol/common-const/cowLinks'

import { COW_PRODUCT_VARIANTS } from '../../pure/ProductLogo'

import { NavItemProps } from './index'

type NavItemChildrenProps = NonNullable<NavItemProps['children']>[number]

const SOCIAL_ICONS: Record<CowSocialId, string> = {
  x: iconSocialXSrc,
  discord: iconSocialDiscordSrc,
  github: iconSocialGithubSrc,
  forum: iconSocialForumSrc,
  snapshot: iconSocialSnapshotSrc,
}

export const SOCIAL_LINKS = COW_SOCIAL_LINKS.map(({ id, label, href, utmContent }) => ({
  href,
  label,
  icon: SOCIAL_ICONS[id],
  external: true,
  utmContent,
}))

export const PRODUCT_LOGO_LINKS = COW_PRODUCT_LINKS.map(({ id, label, href }) => ({
  href,
  label,
  productVariant: COW_PRODUCT_VARIANTS[id],
}))

export const GLOBAL_FOOTER_DESCRIPTION = COW_DAO_DESCRIPTION

export function getAboutFooterNavChildren(): NavItemChildrenProps[] {
  return COW_FOOTER_ABOUT_LINKS.map(toNavItemChild)
}

export function getGlobalFooterNavItems(): NavItemProps[] {
  return COW_FOOTER_NAV_GROUPS.map(({ label, links }) => ({ label, children: links.map(toNavItemChild) }))
}

function toNavItemChild({ label, href, utmContent }: CowLink): NavItemChildrenProps {
  return { label, href, external: true, utmContent }
}
