import { CmsClient } from '@cowprotocol/cms'

type CmsApiClient = ReturnType<typeof CmsClient>

/**
 * Some CMS collections have no usable copy on the barn instance that dev/PR builds point at, so they
 * must be read from production on every environment. See `getProdCmsClient`.
 */
export const PROD_CMS_BASE_URL = 'https://cms.cow.fi/api'

export const CMS_BASE_URL =
  process.env.REACT_APP_CMS_BASE_URL || process.env.NEXT_PUBLIC_CMS_BASE_URL || PROD_CMS_BASE_URL

const cmsClients: Record<string, CmsApiClient> = {}

export function getCmsClient(url: string = CMS_BASE_URL): CmsApiClient {
  const client = cmsClients[url] || CmsClient({ url })

  cmsClients[url] = client

  return client
}

/**
 * Client for the collections that only production serves usefully:
 * - `/solvers`: barn has no `solver_networks` data, so solvers there resolve to raw addresses instead
 *   of names and logos. Production carries both `barn` and `prod` addresses per solver.
 * - `/restricted-token-lists`: barn doesn't have them configured.
 *
 * Everything else keeps using `getCmsClient()`: announcements, account notifications and cow-fi
 * content are environment-scoped, and barn is where they get staged.
 */
export function getProdCmsClient(): CmsApiClient {
  return getCmsClient(PROD_CMS_BASE_URL)
}
