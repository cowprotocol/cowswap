'use client'

import type { ReactNode } from 'react'

import { Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { CampaignSummary } from '../services/cms'

import { CategoryLinks } from '@/components/CategoryLinks'
import { Link } from '@/components/Link'
import { SearchBar } from '@/components/SearchBar'
import { getCampaignLabel } from '@/const/resources'
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
  color: var(${UI.COLOR_NEUTRAL_20});

  > p {
    margin: 0;
    font-size: inherit;
    line-height: inherit;
    color: inherit;
  }
`

const CampaignCount = styled.div`
  flex: 0 0 auto;
  margin-left: auto;
  color: var(${UI.COLOR_NEUTRAL_50});
  font-size: 14px;
  line-height: 1.3;
  white-space: nowrap;
`

interface ResourcesHubComponentProps {
  campaigns: CampaignSummary[]
  allCategories: { name: string; slug: string }[]
}

export function ResourcesHubComponent({ campaigns, allCategories }: ResourcesHubComponentProps): ReactNode {
  return (
    <Wrapper>
      <CategoryLinks allCategories={allCategories} />

      <SearchBar />

      <ContainerCard gap={42} gapMobile={24} minHeight="100vh" alignContent="flex-start" touchFooter>
        <ContainerCardInner maxWidth={970} gap={24} gapMobile={24}>
          <Breadcrumbs padding="0">
            <Link href="/">Home</Link>
            <span>Resources</span>
          </Breadcrumbs>

          <ContainerCardSectionTop>
            <PageTitle>
              <h1>Resources</h1>
            </PageTitle>
          </ContainerCardSectionTop>

          <ContainerCardSection>
            <PageDescription>
              <p>Guides and reference pages from CoW DAO, grouped by topic.</p>
            </PageDescription>

            {campaigns.length === 0 ? (
              <p>No resources have been published yet.</p>
            ) : (
              <LinkSection bgColor="transparent" columns={1} padding="0">
                <LinkColumn>
                  {campaigns.map(({ campaign, count }) => (
                    <LinkItem key={campaign} href={`/resources/${campaign}`}>
                      {getCampaignLabel(campaign)}
                      <CampaignCount>
                        {count} {count === 1 ? 'page' : 'pages'}
                      </CampaignCount>
                      <span>→</span>
                    </LinkItem>
                  ))}
                </LinkColumn>
              </LinkSection>
            )}
          </ContainerCardSection>
        </ContainerCardInner>
      </ContainerCard>
    </Wrapper>
  )
}
