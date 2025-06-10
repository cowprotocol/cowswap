'use client'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { Color, Font, ProductLogo, ProductVariant } from '@cowprotocol/ui'

import { Link, LinkType } from '@/components/Link'
import { CONFIG } from '@/const/meta'
import {
  ContainerCard,
  ContainerCardSection,
  DisclaimerColumn,
  DisclaimerGrid,
  DisclaimerHighlight,
  DisclaimerList,
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
import { CowFiCategory } from 'src/common/analytics/types'

interface CareersPageContentProps {
  department: string
  jobsCountForDepartment: number
  jobsCount: number
  jobsData: Record<string, { id: string; title: string; locationName: string }[]>
}

export function CareersPageContent({
  jobsData,
  department,
  jobsCountForDepartment,
  jobsCount,
}: CareersPageContentProps) {
  const analytics = useCowAnalytics()

  return (
    <PageWrapper>
      <ContainerCard bgColor={Color.neutral90} color={Color.neutral10} touchFooter>
        <ContainerCardSection>
          <SectionTitleWrapper maxWidth={900} margin="0 auto 56px" marginMobile="0 auto 56px">
            <SectionTitleIcon $size={60}>
              <ProductLogo variant={ProductVariant.CowProtocol} theme="dark" logoIconOnly />
            </SectionTitleIcon>
            <SectionTitleText fontSize={62}>Want to build the future of decentralized trading?</SectionTitleText>
            <SectionTitleDescription fontSize={24} color={Color.neutral40} fontWeight={Font.weight.regular}>
              We are an ambitious, fast-growing and international team working at the forefront of DeFi. We believe that
              we can make markets more fair and more efficient by building the ultimate batch auction settlement layer
              across EVM-compatible blockchains
            </SectionTitleDescription>
          </SectionTitleWrapper>

          {/* Jobs content */}
          <SectionTitleWrapper maxWidth={900} margin="0 auto">
            <SectionTitleText fontSize={32}>
              We&apos;re currently hiring for {jobsCountForDepartment} position{jobsCountForDepartment > 1 && 's'}
              {department !== 'All' && ` in ${department}`}:
            </SectionTitleText>
          </SectionTitleWrapper>

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
                      {jobsData[deptName].map(({ id, title, locationName }: any) => (
                        <TopicCard
                          key={id}
                          contentAlign={'left'}
                          bgColor={Color.neutral100}
                          padding={'32px'}
                          gap={16}
                          asProp="div"
                          height="100%"
                        >
                          <TopicCardInner contentAlign="left" contentAlignTablet={'center'} height="100%">
                            <TopicTitle fontSize={16} color={Color.neutral50}>
                              {deptName}
                            </TopicTitle>
                            <TopicTitle fontSize={34}>{title}</TopicTitle>
                            <TopicDescription fontSize={18} color={Color.neutral40} margin="0 0 24px">
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
                      {jobsData[department].map(({ id, title, locationName }: any, index: number) => (
                        <TopicCard
                          key={index}
                          contentAlign={'left'}
                          bgColor={Color.neutral100}
                          padding={'32px'}
                          gap={16}
                          asProp="div"
                        >
                          <TopicCardInner contentAlign="left">
                            <TopicTitle>{title}</TopicTitle>
                            <TopicDescription fontSize={18} color={Color.neutral40} margin="0">
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
                <TopicTitle fontSize={34}>💸 Refer a friend and earn up to 6,000 in USDC or USD!</TopicTitle>

                <TopicDescription fontSize={24} fontWeight={Font.weight.regular} margin="0 0 24px">
                  Know someone who is looking not just for a job, but for a great opportunity to grow? Refer them to
                  earn up to $6,000 in USD or USDC{' '}
                </TopicDescription>
                <Link
                  linkType={LinkType.TopicButton}
                  bgColor={Color.cowamm_dark_green}
                  color={Color.cowamm_green}
                  href="/careers/refer-to-earn"
                  onClick={() =>
                    analytics.sendEvent({
                      category: CowFiCategory.CAREERS,
                      action: 'Click referral',
                      label: 'refer-to-earn',
                    })
                  }
                >
                  Refer-to-Earn details
                </Link>
              </TopicCardInner>
            </TopicCard>
          </TopicList>

          {/* Disclaimer content */}
          <SectionTitleWrapper maxWidth={900} margin="0 auto 32px">
            <SectionTitleText fontSize={32} color={Color.cowfi_orange_bright}>
              Important Notice: Beware of Recruitment Scams
            </SectionTitleText>
            <SectionTitleDescription fontSize={18} color={Color.neutral40} fontWeight={Font.weight.regular}>
              We have been made aware of individuals impersonating our team and reaching out to job seekers via Telegram
              and other unofficial channels, falsely claiming to represent CoW DAO
            </SectionTitleDescription>

            <DisclaimerGrid>
              <DisclaimerColumn>
                <SectionTitleText fontSize={20} fontSizeMobile={18} textAlign="left">
                  We Never:
                </SectionTitleText>
                <DisclaimerList>
                  <li>Ask for payment or wallet information during the hiring process.</li>
                  <li>Request sensitive personal documents (e.g. passport) via chat apps.</li>
                </DisclaimerList>

                <DisclaimerSection>
                  <SectionTitleText fontSize={20} fontSizeMobile={18} textAlign="left">
                    What You Should Do:
                  </SectionTitleText>
                  <DisclaimerList>
                    <li>Do not engage with suspicious messages claiming to offer you a job at CoW DAO.</li>
                    <li>Do not share personal information, crypto wallet data, or make payments.</li>
                    <li>
                      Report impersonation attempts to us at <a href="mailto:people@cow.fi">people@cow.fi</a>.
                    </li>
                    <li>
                      Report fake accounts directly on Telegram or to{' '}
                      <a href="mailto:abuse@telegram.org">abuse@telegram.org</a>.
                    </li>
                  </DisclaimerList>
                </DisclaimerSection>
              </DisclaimerColumn>

              <DisclaimerColumn>
                <SectionTitleText fontSize={20} fontSizeMobile={18} textAlign="left">
                  Official Communication Channels:
                </SectionTitleText>
                <SectionTitleDescription
                  fontSize={16}
                  fontSizeMobile={14}
                  color={Color.neutral40}
                  textAlign="left"
                  margin="8px 0"
                >
                  All our hiring communications come from:
                </SectionTitleDescription>
                <DisclaimerList>
                  <li>Official emails are sent from the cow.fi domain.</li>
                  <li>Telegram (we&apos;ll send confirmation email from the cow.fi domain).</li>
                  <li>
                    Verified listings on{' '}
                    <a href="https://linkedin.com/company/cow-protocol" target="_blank" rel="noopener noreferrer">
                      LinkedIn
                    </a>{' '}
                    or official job boards.
                  </li>
                  <li>Official email or video conferencing platforms (Zoom, Meet).</li>
                </DisclaimerList>

                <DisclaimerHighlight>
                  <SectionTitleDescription
                    fontSize={16}
                    fontSizeMobile={14}
                    color={Color.neutral30}
                    textAlign="left"
                    margin="0 0 12px"
                  >
                    We are actively working to report and remove these impersonators. Your safety and trust are
                    important to us.
                  </SectionTitleDescription>
                  <SectionTitleDescription
                    fontSize={16}
                    fontSizeMobile={14}
                    color={Color.neutral30}
                    textAlign="left"
                    margin="0"
                  >
                    Stay safe,
                    <br />
                    The CoW DAO Team
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
