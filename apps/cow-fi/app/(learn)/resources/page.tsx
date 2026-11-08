import type { ReactNode } from 'react'

import { getCampaignSummaries } from '../../../services/cms'

import type { Metadata } from 'next'

import { ResourcesHubComponent } from '@/components/ResourcesHubComponent'
import { getPageMetadata } from '@/util/getPageMetadata'
import { loadAllCategories } from '@/util/loadAllCategories'

export const revalidate = 43200

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata({
    title: 'Resources',
    description: 'Guides and reference pages from CoW DAO.',
  })
}

export default async function ResourcesPage(): Promise<ReactNode> {
  const [campaigns, allCategories] = await Promise.all([getCampaignSummaries(), loadAllCategories()])

  return <ResourcesHubComponent campaigns={campaigns} allCategories={allCategories} />
}
