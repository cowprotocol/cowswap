'use client'

import type { ReactNode } from 'react'

import { Font, Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { Resource } from '../services/cms'

import { Link } from '@/components/Link'
import { getCampaignLabel, getResourcePath } from '@/const/resources'
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
`

const ResourceDescription = styled.span`
  display: block;
  margin-top: 8px;
  color: var(${UI.COLOR_NEUTRAL_50});
  font-size: ${Font.size.small};
  line-height: 1.4;
`

interface ResourcesCampaignComponentProps {
  campaign: string
  resources: Resource[]
}

export function ResourcesCampaignComponent({ campaign, resources }: ResourcesCampaignComponentProps): ReactNode {
  const campaignLabel = getCampaignLabel(campaign)

  return (
    <Wrapper>
      <Breadcrumbs>
        <Link href="/">Home</Link>
        <Link href="/resources">Resources</Link>
        <span>{campaignLabel}</span>
      </Breadcrumbs>

      <h1>{campaignLabel}</h1>

      <ContainerCard gap={42} gapMobile={24} touchFooter>
        <ContainerCardInner maxWidth={970} gap={24} gapMobile={24}>
          <ContainerCardSectionTop>
            <ContainerCardSectionTopTitle>Pages</ContainerCardSectionTopTitle>
          </ContainerCardSectionTop>
          <ContainerCardSection>
            <LinkColumn>
              {resources.map((resource) => {
                const attributes = resource.attributes
                if (!attributes?.slug) return null

                return (
                  <LinkItem key={resource.id} href={getResourcePath(campaign, attributes.slug)}>
                    {attributes.title}
                    {attributes.description ? (
                      <ResourceDescription>{attributes.description}</ResourceDescription>
                    ) : null}
                    <span>→</span>
                  </LinkItem>
                )
              })}
            </LinkColumn>
          </ContainerCardSection>
        </ContainerCardInner>
      </ContainerCard>
    </Wrapper>
  )
}
