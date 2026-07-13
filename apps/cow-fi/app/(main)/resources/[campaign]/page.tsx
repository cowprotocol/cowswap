import type { ReactNode } from 'react'

import { notFound } from 'next/navigation'

import { getCampaignSummaries, getResources } from '../../../../services/cms'

import type { Metadata } from 'next'

import { ResourcesCampaignComponent } from '@/components/ResourcesCampaignComponent'
import { getCampaignLabel } from '@/const/resources'
import { getPageMetadata } from '@/util/getPageMetadata'

export const revalidate = 43200

type Props = {
  params: Promise<{ campaign: string }>
}

export async function generateStaticParams(): Promise<{ campaign: string }[]> {
  const campaigns = await getCampaignSummaries()
  return campaigns.map(({ campaign }) => ({ campaign }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const campaign = (await params).campaign
  const label = getCampaignLabel(campaign)

  return getPageMetadata({
    title: label,
    description: `Programmatic ${label.toLowerCase()} resources from CoW DAO.`,
  })
}

export default async function ResourcesCampaignPage({ params }: Props): Promise<ReactNode> {
  const campaign = (await params).campaign
  const resourcesResponse = await getResources({
    filters: {
      campaign: {
        $eq: campaign,
      },
    },
  })

  if (resourcesResponse.data.length === 0) {
    return notFound()
  }

  return <ResourcesCampaignComponent campaign={campaign} resources={resourcesResponse.data} />
}
