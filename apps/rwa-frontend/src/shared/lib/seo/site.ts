import 'server-only'

import { BASE_PATH } from '@/shared/config'

export const SITE_NAME = 'CoW RWA'

export const SITE_DESCRIPTION =
  'Trade tokenized stocks and ETFs onchain with CoW Protocol. Compare Ondo, xStocks, Coinbase, bStocks and Reality tokens across networks, with MEV protection.'

/** The CoW Swap origin, which serves the app under `BASE_PATH` */
export const SITE_ORIGIN = new URL(process.env.NEXT_PUBLIC_SITE_ORIGIN || 'https://swap.cow.fi')

/** E.g. `https://swap.cow.fi/rwa` */
export const SITE_URL = `${SITE_ORIGIN.origin}${BASE_PATH}`

const PREVIEW_HOST =
  process.env.VERCEL_ENV === 'preview' ? process.env.VERCEL_BRANCH_URL || process.env.VERCEL_URL : undefined

/** Where this deployment serves the app: a Vercel preview links its own images, which `SITE_URL` doesn't serve yet */
export const DEPLOYMENT_URL = PREVIEW_HOST ? `https://${PREVIEW_HOST}${BASE_PATH}` : SITE_URL

/** Only the production deployment is open to search engines */
export const IS_INDEXABLE = process.env.VERCEL_ENV === 'production'
