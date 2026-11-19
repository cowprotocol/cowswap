import type { ReactNode } from 'react'

import { notFound } from 'next/navigation'

import { getAllResources } from '../../../../services/cms'

import type { Metadata } from 'next'

import { ResourcesCampaignComponent } from '@/components/ResourcesCampaignComponent'
import { getCampaignLabel } from '@/const/resources'
import { getPageMetadata } from '@/util/getPageMetadata'

export const revalidate = 43200

type Props = {
  params: Promise<{ campaign: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const campaign = (await params).campaign
  const label = getCampaignLabel(campaign)

  return getPageMetadata({
    title: label,
    description: `Programmatic ${label.toLowerCase()} resources from CoW DAO.`,
  })
}

export function generateStaticParams(): [] {
  // Generate on first request so builds can finish during a partial CMS outage.
  return []
}

export default async function ResourcesCampaignPage({ params }: Props): Promise<ReactNode> {
  const campaign = (await params).campaign
  const resources = await getAllResources({
    filters: {
      campaign: {
        $eq: campaign,
      },
    },
  })

  if (resources.length === 0) {
    return notFound()
  }

  return <ResourcesCampaignComponent campaign={campaign} resources={resources} />
}
