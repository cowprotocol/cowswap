import { CmsClient } from '@cowprotocol/cms'

/**
 * Solver info must always come from the production CMS: the barn instance dev/PR builds point at has
 * no `solver_networks` data, so solvers there resolve to raw addresses instead of names and logos.
 * The production CMS carries both `barn` and `prod` addresses per solver, so it serves every environment.
 */
export const PROD_CMS_BASE_URL = 'https://cms.cow.fi/api'

export const CMS_BASE_URL =
  process.env.REACT_APP_CMS_BASE_URL || process.env.NEXT_PUBLIC_CMS_BASE_URL || PROD_CMS_BASE_URL

const cmsClients: Record<string, ReturnType<typeof CmsClient>> = {}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function getCmsClient(url: string = CMS_BASE_URL) {
  const client = cmsClients[url] || CmsClient({ url })

  cmsClients[url] = client

  return client
}
