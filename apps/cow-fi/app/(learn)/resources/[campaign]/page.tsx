import type { ReactNode } from 'react'

import { notFound } from 'next/navigation'

import { getAllResources, getCampaignSummaries } from '../../../../services/cms'

import type { Metadata } from 'next'

import { ResourcesCampaignComponent } from '@/components/ResourcesCampaignComponent'
import { getCampaignLabel } from '@/const/resources'
import { getPageMetadata } from '@/util/getPageMetadata'
import { loadAllCategories } from '@/util/loadAllCategories'

export const revalidate = 43200

type Props = {
  params: Promise<{ campaign: string }>
}

/** Page metadata for a single Resources campaign. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const campaign = (await params).campaign
  const label = getCampaignLabel(campaign)

  return getPageMetadata({
    title: label,
    description: `${label} guides and reference pages from CoW DAO.`,
  })
}

/** Pre-renders one page per published campaign. */
export async function generateStaticParams(): Promise<{ campaign: string }[]> {
  const campaigns = await getCampaignSummaries()
  return campaigns.map(({ campaign }) => ({ campaign }))
}

/** Resources campaign page: lists all resources in a campaign. */
export default async function ResourcesCampaignPage({ params }: Props): Promise<ReactNode> {
  const campaign = (await params).campaign
  const [resources, allCategories] = await Promise.all([
    getAllResources({
      filters: {
        campaign: {
          $eq: campaign,
        },
      },
    }),
    loadAllCategories(),
  ])

  if (resources.length === 0) {
    return notFound()
  }

  return <ResourcesCampaignComponent campaign={campaign} resources={resources} allCategories={allCategories} />
}
