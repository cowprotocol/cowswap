import { normalizeError } from '@cowprotocol/common-utils/errors'

import { parseAffiliateContent, parseCareersContent } from './marketingContent'

import { getPageBySlug } from '../services/cms'

import type { AffiliateContent, CareersContent } from './marketingContent'

import fallbackContent from '@/data/marketingContentFallback.json'

export async function getAffiliateContent(): Promise<AffiliateContent> {
  return getMarketingContent('affiliate-program', parseAffiliateContent, fallbackContent.affiliateProgram)
}

export async function getCareersContent(): Promise<CareersContent> {
  return getMarketingContent('careers', parseCareersContent, fallbackContent.careers)
}

async function getMarketingContent<T>(slug: string, parse: (page: unknown) => T, fallback: T): Promise<T> {
  try {
    return parse(await getPageBySlug(slug))
  } catch (err: unknown) {
    const error = normalizeError(err)
    console.error(`[cow-fi] Using bundled ${slug} copy after a CMS failure`, error)
    return fallback
  }
}
