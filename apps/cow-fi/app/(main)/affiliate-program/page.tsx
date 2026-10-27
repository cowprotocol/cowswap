import type { ReactNode } from 'react'

import { AffiliateProgramPageContent } from '@/components/AffiliateProgramPageContent'
import { getAffiliateContent } from '@/util/getMarketingContent'

export default async function Page(): Promise<ReactNode> {
  const content = await getAffiliateContent()
  return <AffiliateProgramPageContent content={content} />
}

export const revalidate = 43200
