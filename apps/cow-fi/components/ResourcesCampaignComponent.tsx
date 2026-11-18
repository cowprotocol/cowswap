'use client'

import type { ReactNode } from 'react'

import { Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { Resource } from '../services/cms'

import { ArrowButton } from '@/components/ArrowButton'
import { CategoryLinks } from '@/components/CategoryLinks'
import { Link } from '@/components/Link'
import { SearchBar } from '@/components/SearchBar'
import { getCampaignLabel, getResourcePath } from '@/const/resources'
import {
  Breadcrumbs,
  ContainerCard,
  ContainerCardInner,
  ContainerCardSection,
  ContainerCardSectionTop,
  LinkColumn,
  LinkItem,
  LinkSection,
} from '@/styles/styled'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 1760px;
  width: 100%;
  margin: 24px auto 0;
  gap: 34px;
  padding: 0 16px;

  ${Media.upToMedium()} {
    margin: 0 auto;
    gap: 24px;
  }
`

const PageTitle = styled.div`
  font-size: 52px;

  ${Media.upToMedium()} {
    font-size: 32px;
  }

  > h1 {
    font-size: inherit;
  }
`

const PageDescription = styled.div`
  font-size: 21px;
  line-height: 1.5;
  display: flex;
  flex-flow: column wrap;
  gap: 24px;

  > i {
    font-size: 16px;
    font-weight: var(${UI.FONT_WEIGHT_BOLD});
    color: var(${UI.COLOR_NEUTRAL_0});
    font-style: normal;
  }
`

const ResourceText = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-width: 0;
`

const ResourceTitle = styled.div`
  display: block;
  line-height: 1.3;
`

const ResourceDescription = styled.div`
  display: block;
  margin-top: 8px;
  color: var(${UI.COLOR_NEUTRAL_50});
  font-size: 14px;
  line-height: 1.4;
  white-space: normal;
`

/** Props for {@link ResourcesCampaignComponent}. */
interface ResourcesCampaignComponentProps {
  campaign: string
  resources: Resource[]
  allCategories: { name: string; slug: string }[]
}

/** Campaign page body: category links, search, resource count, and the resource list. */
export function ResourcesCampaignComponent({
  campaign,
  resources,
  allCategories,
}: ResourcesCampaignComponentProps): ReactNode {
  const campaignLabel = getCampaignLabel(campaign)

  return (
    <Wrapper>
      <CategoryLinks allCategories={allCategories} />

      <SearchBar />

      <ContainerCard gap={42} gapMobile={24} minHeight="100vh" alignContent="flex-start" touchFooter>
        <ContainerCardInner maxWidth={970} gap={24} gapMobile={24}>
          <Breadcrumbs padding="0">
            <Link href="/">Home</Link>
            <Link href="/resources">Resources</Link>
            <span>{campaignLabel}</span>
          </Breadcrumbs>

          <ContainerCardSectionTop>
            <PageTitle>
              <h1>{campaignLabel}</h1>
            </PageTitle>
            <ArrowButton link="/resources" text="All resources" />
          </ContainerCardSectionTop>

          <ContainerCardSection>
            <PageDescription>
              <i>
                {resources.length} {resources.length === 1 ? 'page' : 'pages'}
              </i>
            </PageDescription>

            <LinkSection bgColor="transparent" columns={1} padding="0">
              <LinkColumn>
                {resources.map((resource) => {
                  const attributes = resource.attributes
                  if (!attributes?.slug) return null

                  return (
                    <LinkItem key={resource.id} href={getResourcePath(campaign, attributes.slug)}>
                      <ResourceText>
                        <ResourceTitle>{attributes.title}</ResourceTitle>
                        {attributes.description ? (
                          <ResourceDescription>{attributes.description}</ResourceDescription>
                        ) : null}
                      </ResourceText>
                      <span>→</span>
                    </LinkItem>
                  )
                })}
              </LinkColumn>
            </LinkSection>
          </ContainerCardSection>
        </ContainerCardInner>
      </ContainerCard>
    </Wrapper>
  )
}
