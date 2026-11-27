'use client'

import type { ReactNode } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { Color, ProductLogo, ProductVariant, UI } from '@cowprotocol/ui'

import { CowFiCategory } from 'src/common/analytics/types'

import type { CareersContent } from '@/util/marketingContent'

import { CmsInlineCopy, CmsNoticeCopy } from '@/components/CmsMarketingCopy'
import { Link, LinkType } from '@/components/Link'
import { CONFIG } from '@/const/meta'
import {
  ContainerCard,
  ContainerCardSection,
  DisclaimerColumn,
  DisclaimerGrid,
  DisclaimerHighlight,
  DisclaimerSection,
  PageWrapper,
  SectionTitleDescription,
  SectionTitleIcon,
  SectionTitleText,
  SectionTitleWrapper,
  TopicCard,
  TopicCardInner,
  TopicDescription,
  TopicList,
  TopicTitle,
} from '@/styles/styled'

interface CareersPageContentProps {
  content: CareersContent
  department: string
  jobsCountForDepartment: number
  jobsCount: number
  jobsData: Record<string, { id: string; title: string; locationName: string }[]>
}

export function CareersPageContent({
  jobsData,
  content,
  department,
  jobsCountForDepartment,
  jobsCount,
}: CareersPageContentProps): ReactNode {
  const analytics = useCowAnalytics()
  const { intro, referral, notice } = content

  return (
    <PageWrapper>
      <ContainerCard bgColor={`var(${UI.COLOR_NEUTRAL_90})`} color={`var(${UI.COLOR_NEUTRAL_10})`} touchFooter>
        <ContainerCardSection>
          <SectionTitleWrapper maxWidth={900} margin="0 auto 56px" marginMobile="0 auto 56px">
            <SectionTitleIcon $size={60}>
              <ProductLogo variant={ProductVariant.CowProtocol} theme="dark" logoIconOnly />
            </SectionTitleIcon>
            <SectionTitleText fontSize={62}>{intro.title}</SectionTitleText>
            <SectionTitleDescription
              fontSize={24}
              color={`var(${UI.COLOR_NEUTRAL_40})`}
              fontWeight={`var(${UI.FONT_WEIGHT_NORMAL})`}
            >
              <CmsInlineCopy content={intro.description} />
            </SectionTitleDescription>
          </SectionTitleWrapper>

          {/* Jobs content */}
          {jobsCountForDepartment > 0 && (
            <SectionTitleWrapper maxWidth={900} margin="0 auto">
              <SectionTitleText fontSize={32}>
                We&apos;re currently hiring for {jobsCountForDepartment} position{jobsCountForDepartment > 1 && 's'}
                {department !== 'All' && ` in ${department}`}:
              </SectionTitleText>
            </SectionTitleWrapper>
          )}

          {jobsCount < 1 && (
            <SectionTitleWrapper maxWidth={900} margin="0 auto">
              <SectionTitleText fontSize={32}>There are currently no open positions.</SectionTitleText>
            </SectionTitleWrapper>
          )}

          <TopicList columns={2} columnsTablet={2} maxWidth={900} margin="16px auto 0">
            {jobsCount > 0 &&
              (department === 'All'
                ? Object.keys(jobsData).map((deptName: string) => (
                    <>
                      {jobsData[deptName].map(({ id, title, locationName }) => (
                        <TopicCard
                          key={id}
                          contentAlign={'left'}
                          bgColor={`var(${UI.COLOR_NEUTRAL_100})`}
                          padding={'32px'}
                          gap={16}
                          asProp="div"
                          height="100%"
                        >
                          <TopicCardInner contentAlign="left" contentAlignTablet={'center'} height="100%">
                            <TopicTitle fontSize={16} color={`var(${UI.COLOR_NEUTRAL_50})`}>
                              {deptName}
                            </TopicTitle>
                            <TopicTitle fontSize={34}>{title}</TopicTitle>
                            <TopicDescription fontSize={18} color={`var(${UI.COLOR_NEUTRAL_40})`} margin="0 0 24px">
                              {locationName}
                            </TopicDescription>
                            <Link
                              external
                              linkType={LinkType.TopicButton}
                              href={`https://jobs.ashbyhq.com/cow-dao/${id}`}
                              utmContent={`job-${title}`}
                              margin="auto auto 0 0"
                              marginTablet="auto auto 0"
                              onClick={() =>
                                analytics.sendEvent({
                                  category: CowFiCategory.CAREERS,
                                  action: 'Click job',
                                  label: `job-${title}`,
                                })
                              }
                            >
                              Apply
                            </Link>
                          </TopicCardInner>
                        </TopicCard>
                      ))}
                    </>
                  ))
                : jobsCount > 0 && (
                    <>
                      <h4>{department}</h4>
                      {jobsData[department].map(({ id, title, locationName }, index: number) => (
                        <TopicCard
                          key={index}
                          contentAlign={'left'}
                          bgColor={`var(${UI.COLOR_NEUTRAL_100})`}
                          padding={'32px'}
                          gap={16}
                          asProp="div"
                        >
                          <TopicCardInner contentAlign="left">
                            <TopicTitle>{title}</TopicTitle>
                            <TopicDescription fontSize={18} color={`var(${UI.COLOR_NEUTRAL_40})`} margin="0">
                              {locationName}
                            </TopicDescription>
                            <Link
                              external
                              linkType={LinkType.TopicButton}
                              href={`https://jobs.ashbyhq.com/cow-dao/${id}`}
                              utmContent={`job-${title}`}
                              onClick={() =>
                                analytics.sendEvent({
                                  category: CowFiCategory.CAREERS,
                                  action: 'Click job',
                                  label: `job-${title}`,
                                })
                              }
                            >
                              Apply
                            </Link>
                          </TopicCardInner>
                        </TopicCard>
                      ))}
                    </>
                  ))}

            {jobsCount > 0 && (
              <TopicCard
                bgColor={Color.cowamm_green}
                textColor={Color.cowamm_dark_green}
                padding={'32px'}
                gap={16}
                asProp="div"
                height="100%"
                fullWidth
              >
                <TopicCardInner contentAlign="left" height="100%">
                  <TopicTitle fontSize={34}>{referral.title}</TopicTitle>

                  <TopicDescription fontSize={24} fontWeight={`var(${UI.FONT_WEIGHT_NORMAL})`} margin="0 0 24px">
                    <CmsInlineCopy content={referral.description} />
                  </TopicDescription>
                  <Link
                    linkType={LinkType.TopicButton}
                    bgColor={Color.cowamm_dark_green}
                    color={Color.cowamm_green}
                    href={referral.button.url}
                    external={referral.button.newTab}
                    onClick={() =>
                      analytics.sendEvent({
                        category: CowFiCategory.CAREERS,
                        action: 'Click referral',
                        label: 'refer-to-earn',
                      })
                    }
                  >
                    {referral.button.text}
                  </Link>
                </TopicCardInner>
              </TopicCard>
            )}
          </TopicList>

          {/* Disclaimer content */}
          <SectionTitleWrapper maxWidth={900} margin="0 auto 32px">
            <SectionTitleText fontSize={32} color={Color.cowfi_orange_bright}>
              {notice.title}
            </SectionTitleText>
            <SectionTitleDescription
              fontSize={18}
              color={`var(${UI.COLOR_NEUTRAL_40})`}
              fontWeight={`var(${UI.FONT_WEIGHT_NORMAL})`}
            >
              <CmsInlineCopy content={notice.description} />
            </SectionTitleDescription>

            <DisclaimerGrid>
              <DisclaimerColumn>
                <SectionTitleText fontSize={20} fontSizeMobile={18} textAlign="left">
                  {notice.never.title}
                </SectionTitleText>
                <CmsNoticeCopy content={notice.never.description} />
                <DisclaimerSection>
                  <SectionTitleText fontSize={20} fontSizeMobile={18} textAlign="left">
                    {notice.actions.title}
                  </SectionTitleText>
                  <CmsNoticeCopy content={notice.actions.description} />
                </DisclaimerSection>
              </DisclaimerColumn>

              <DisclaimerColumn>
                <SectionTitleText fontSize={20} fontSizeMobile={18} textAlign="left">
                  {notice.channels.title}
                </SectionTitleText>
                <CmsNoticeCopy content={notice.channels.description} />

                <DisclaimerHighlight>
                  <SectionTitleDescription
                    fontSize={16}
                    fontSizeMobile={14}
                    color={`var(${UI.COLOR_NEUTRAL_30})`}
                    textAlign="left"
                    margin="0 0 12px"
                  >
                    <CmsInlineCopy content={notice.closing.title} />
                  </SectionTitleDescription>
                  <SectionTitleDescription
                    fontSize={16}
                    fontSizeMobile={14}
                    color={`var(${UI.COLOR_NEUTRAL_30})`}
                    textAlign="left"
                    margin="0"
                  >
                    <CmsInlineCopy content={notice.closing.description} />
                  </SectionTitleDescription>
                </DisclaimerHighlight>
              </DisclaimerColumn>
            </DisclaimerGrid>
          </SectionTitleWrapper>
          {/* End of disclaimer content */}

          <SectionTitleWrapper maxWidth={900} margin="32px auto">
            <SectionTitleText fontSize={24}>
              {jobsCount < 1 && 'Currently there are no open positions. Convinced you can contribute to Cow Protocol?'}
              {jobsCount > 0 && "Can't find the position you're looking for?"}{' '}
              <a href={CONFIG.social.discord.url} target="_blank" rel="noopener nofollow">
                Get in touch
              </a>
            </SectionTitleText>
          </SectionTitleWrapper>
        </ContainerCardSection>
      </ContainerCard>
    </PageWrapper>
  )
}
