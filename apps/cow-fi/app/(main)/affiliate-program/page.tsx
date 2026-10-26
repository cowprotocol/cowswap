import type { ReactNode } from 'react'

import { getPageBySlug } from '../../../services/cms'

import { AffiliateProgramPageContent } from '@/components/AffiliateProgramPageContent'
import { parseAffiliateContent } from '@/util/marketingContent'

export default async function Page(): Promise<ReactNode> {
  const page = await getPageBySlug('affiliate-program')
  return <AffiliateProgramPageContent content={parseAffiliateContent(page)} />
}

export const revalidate = 43200
