import type { ReactNode } from 'react'

import { getCampaignSummaries } from '../../../services/cms'

import type { Metadata } from 'next'

import { ResourcesHubComponent } from '@/components/ResourcesHubComponent'
import { getPageMetadata } from '@/util/getPageMetadata'

export const revalidate = 43200

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata({
    title: 'Resources',
    description: 'Programmatic reference content published by CoW DAO.',
  })
}

export default async function ResourcesPage(): Promise<ReactNode> {
  const campaigns = await getCampaignSummaries()

  return <ResourcesHubComponent campaigns={campaigns} />
}
