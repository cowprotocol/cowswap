import 'server-only'

import { COW_DAO_DESCRIPTION, COW_DAO_LINK, COW_SOCIAL_LINKS } from '@cowprotocol/common-const/cowLinks'

import { DEPLOYMENT_URL, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from './site'

export interface BreadcrumbItem {
  name: string
  /** Path under the base path, `''` for the home page */
  path: string
}

const ORGANIZATION_ID = `${COW_DAO_LINK.href}#organization`
const WEBSITE_ID = `${SITE_URL}#website`

export function buildBreadcrumbList(items: BreadcrumbItem[]): object {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map(({ name, path }, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name,
      item: `${SITE_URL}${path}`,
    })),
  }
}

/** schema.org `Organization` and `WebSite` of the whole site, for the root layout */
export function buildSiteStructuredData(): object {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': ORGANIZATION_ID,
        name: COW_DAO_LINK.label,
        url: COW_DAO_LINK.href,
        description: COW_DAO_DESCRIPTION,
        logo: `${DEPLOYMENT_URL}/icons/512`,
        sameAs: COW_SOCIAL_LINKS.map(({ href }) => href),
      },
      {
        '@type': 'WebSite',
        '@id': WEBSITE_ID,
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        inLanguage: 'en',
        publisher: { '@id': ORGANIZATION_ID },
      },
    ],
  }
}

/** A schema.org `WebPage` of the site, `@context` included */
export function buildWebPage(
  page: { path: string; name: string; description: string } & Record<string, unknown>,
): object {
  const { path, ...fields } = page

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${SITE_URL}${path}`,
    url: `${SITE_URL}${path}`,
    isPartOf: { '@id': WEBSITE_ID },
    inLanguage: 'en',
    ...fields,
  }
}
