import { useState } from 'react'
import { getJobs } from 'services/greenhouse'
import { GetStaticProps } from 'next'
import { Font, Color, ProductLogo, ProductVariant } from '@cowprotocol/ui'
import styled from 'styled-components'

import { CONFIG } from '@/const/meta'

import Layout from '@/components/Layout'
import { Link, LinkType } from '@/components/Link'

import {
  ContainerCard,
  ContainerCardSection,
  TopicList,
  TopicCard,
  TopicTitle,
  TopicDescription,
  SectionTitleWrapper,
  SectionTitleIcon,
  SectionTitleText,
  SectionTitleDescription,
  TopicCardInner,
} from '@/styles/styled'

import { GAEventCategories } from 'lib/analytics/GAEvents'
import { sendGAEventHandler } from 'lib/analytics/sendGAEvent'

const DATA_CACHE_TIME_SECONDS = 5 * 60 // Cache 5min

interface PageProps {
  siteConfigData: typeof CONFIG
  jobsData: any
}

const Wrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  justify-content: center;
  align-items: center;
  max-width: 1760px;
  width: 100%;
  margin: 76px auto 0;
  gap: 24px;
`

export default function Page({ siteConfigData, jobsData }: PageProps) {
  const { title } = siteConfigData
  const [department, setDepartment] = useState('All')

  const jobsCount = Object.keys(jobsData).reduce((acc, cur) => acc + jobsData[cur].length, 0)
  const jobsCountForDepartment = department === 'All' ? jobsCount : jobsData[department].length

  return (
    <Layout
      bgColor={Color.neutral90}
      metaTitle={`Careers - ${title}`}
      metaDescription="We are an ambitious, fast-growing and international team working at the forefront of DeFi. We believe that we can make markets more fair and more efficient by building the ultimate batch auction settlement layer across EVM-compatible blockchains."
    >
      <Wrapper>
        <ContainerCard bgColor={Color.neutral90} color={Color.neutral10} padding="0 60px 60px" touchFooter>
          <ContainerCardSection>
            <SectionTitleWrapper maxWidth={900} margin="0 auto 56px">
              <SectionTitleIcon size={60}>
                <ProductLogo variant={ProductVariant.CowProtocol} theme="dark" logoIconOnly />
              </SectionTitleIcon>
              <SectionTitleText fontSize={62}>Want to build the future of decentralized trading?</SectionTitleText>
              <SectionTitleDescription fontSize={24} color={Color.neutral40} fontWeight={Font.weight.regular}>
                We are an ambitious, fast-growing and international team working at the forefront of DeFi. We believe
                that we can make markets more fair and more efficient by building the ultimate batch auction settlement
                layer across EVM-compatible blockchains.
              </SectionTitleDescription>
            </SectionTitleWrapper>

            <SectionTitleWrapper maxWidth={900} margin="0 auto">
              <SectionTitleText fontSize={32}>
                We&apos;re currently hiring for {jobsCountForDepartment} position{jobsCountForDepartment > 1 && 's'}
                {department !== 'All' && ` in ${department}`}:
              </SectionTitleText>
            </SectionTitleWrapper>

            {jobsCount < 1 && <p>There are currently no open positions.</p>}

            <TopicList columns={2} maxWidth={900} margin="16px auto 0">
              {jobsCount > 0 &&
                (department === 'All'
                  ? Object.keys(jobsData).map((deptName: string) => (
                      <>
                        {jobsData[deptName].map(({ absolute_url, title, location }: any, index: number) => (
                          <TopicCard
                            key={index}
                            contentAlign={'left'}
                            bgColor={Color.neutral100}
                            padding={'32px'}
                            gap={16}
                            asProp="div"
                            height="100%"
                          >
                            <TopicCardInner contentAlign="left" height="100%">
                              <TopicTitle fontSize={16} color={Color.neutral50}>
                                {deptName}
                              </TopicTitle>
                              <TopicTitle fontSize={34}>{title}</TopicTitle>
                              <TopicDescription fontSize={18} color={Color.neutral40} margin="0 0 24px">
                                {location.name}
                              </TopicDescription>
                              <Link
                                external
                                linkType={LinkType.TopicButton}
                                href={absolute_url}
                                utmContent={`job-${title}`}
                                margin="auto auto 0 0"
                                onClick={() => sendGAEventHandler(GAEventCategories.CAREERS, `click-job-${title}`)}
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
                        {jobsData[department].map(({ absolute_url, title, location }: any, index: number) => (
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
                                {location.name}
                              </TopicDescription>
                              <Link
                                external
                                linkType={LinkType.TopicButton}
                                href={absolute_url}
                                utmContent={`job-${title}`}
                                onClick={() => sendGAEventHandler(GAEventCategories.CAREERS, `click-job-${title}`)}
                              >
                                Apply
                              </Link>
                            </TopicCardInner>
                          </TopicCard>
                        ))}
                      </>
                    ))}

              <TopicCard
                bgColor={'#BCEC79'}
                textColor="#194D05"
                padding={'32px'}
                gap={16}
                asProp="div"
                height="100%"
                fullWidth
              >
                <TopicCardInner contentAlign="left" height="100%">
                  <TopicTitle fontSize={34}>💸 Refer a friend and earn 6,000 in USDC or USD!</TopicTitle>

                  <TopicDescription fontSize={24} fontWeight={Font.weight.regular} margin="0 0 24px">
                    Know someone who is looking not just for a job, but for a great opportunity to grow? Refer them to
                    earn $6,000 in USD or USDC.{' '}
                  </TopicDescription>
                  <Link
                    linkType={LinkType.TopicButton}
                    bgColor="#194D05"
                    color="#BCEC79"
                    href="/careers/refer-to-earn"
                    onClick={() => sendGAEventHandler(GAEventCategories.CAREERS, `click-refer-to-earn`)}
                  >
                    Refer-to-Earn details
                  </Link>
                </TopicCardInner>
              </TopicCard>
            </TopicList>

            <SectionTitleWrapper maxWidth={900} margin="32px auto">
              <SectionTitleText fontSize={24}>
                {jobsCount < 1 &&
                  'Currently there are no open positions. Convinced you can contribute to Cow Protocol?'}
                {jobsCount > 0 && "Can't find the position you're looking for?"}{' '}
                <a href={CONFIG.social.discord.url} target="_blank" rel="noopener nofollow">
                  Get in touch
                </a>
              </SectionTitleText>
            </SectionTitleWrapper>
          </ContainerCardSection>
        </ContainerCard>
      </Wrapper>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps<PageProps> = async () => {
  const siteConfigData = CONFIG
  const jobsData = await getJobs()

  return {
    props: {
      siteConfigData,
      jobsData,
    },
    revalidate: DATA_CACHE_TIME_SECONDS,
  }
}
