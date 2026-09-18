'use client'

import type { ReactNode } from 'react'

import { Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { CampaignSummary } from '../services/cms'

import { Link } from '@/components/Link'
import { getCampaignLabel } from '@/const/resources'
import {
  Breadcrumbs,
  ContainerCard,
  ContainerCardInner,
  ContainerCardSection,
  ContainerCardSectionTop,
  ContainerCardSectionTopTitle,
  LinkColumn,
  LinkItem,
} from '@/styles/styled'

const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin: 24px auto 0;
  gap: 34px;
  max-width: 1760px;

  > h1 {
    font-size: 67px;
    text-align: center;

    ${Media.upToMedium()} {
      font-size: 38px;
    }
  }

  > p {
    max-width: 720px;
    text-align: center;
    color: var(${UI.COLOR_NEUTRAL_50});
    font-size: 18px;
    line-height: 1.5;
  }
`

const CampaignCount = styled.span`
  color: var(${UI.COLOR_NEUTRAL_50});
  font-size: 14px;
`

interface ResourcesHubComponentProps {
  campaigns: CampaignSummary[]
}

export function ResourcesHubComponent({ campaigns }: ResourcesHubComponentProps): ReactNode {
  return (
    <Wrapper>
      <Breadcrumbs>
        <Link href="/">Home</Link>
        <span>Resources</span>
      </Breadcrumbs>

      <h1>Resources</h1>
      <p>Programmatic reference content published by CoW DAO, grouped by campaign.</p>

      <ContainerCard gap={42} gapMobile={24} touchFooter>
        <ContainerCardInner maxWidth={970} gap={24} gapMobile={24}>
          <ContainerCardSectionTop>
            <ContainerCardSectionTopTitle>Campaigns</ContainerCardSectionTopTitle>
          </ContainerCardSectionTop>
          <ContainerCardSection>
            {campaigns.length === 0 ? (
              <p>No resources have been published yet.</p>
            ) : (
              <LinkColumn>
                {campaigns.map(({ campaign, count }) => (
                  <LinkItem key={campaign} href={`/resources/${campaign}`}>
                    {getCampaignLabel(campaign)}
                    <CampaignCount>
                      {count} {count === 1 ? 'page' : 'pages'} →
                    </CampaignCount>
                  </LinkItem>
                ))}
              </LinkColumn>
            )}
          </ContainerCardSection>
        </ContainerCardInner>
      </ContainerCard>
    </Wrapper>
  )
}
