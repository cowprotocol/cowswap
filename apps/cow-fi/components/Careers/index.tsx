import { useState } from 'react'
import { CONFIG } from '@/const/meta'
import { Button, ButtonVariant } from '@/components/Button'
import { Section, Title, SubTitle, TitleSmall, LinkContainer, Card } from '@/components/Layout/index.styles'
import { DropDown, ExternalLink } from 'styles/global.styles'
import SVG from 'react-inlinesvg'

export function Careers({ jobsData }) {
  const [department, setDepartment] = useState('All')
  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDepartment(e.target.value)
  }

  const jobsCount = Object.keys(jobsData).reduce((acc, cur) => acc + jobsData[cur].length, 0)
  const departments = Object.keys(jobsData).map((deptsName: string) => deptsName)
  const jobsCountForDepartment = department === 'All' ? jobsCount : jobsData[department].length

  return (
    <>
      <Section>
        <Title>Want to build the future of decentralized trading?</Title>
        <SubTitle>
          We are an ambitious, fast growing and international team working at the forefront of DeFi. We believe that we
          can make markets both more efficient and fair, by building the ultimate batch auction settlement layer across
          EVM compatible blockchains.
        </SubTitle>
      </Section>

      {jobsCount > 0 && (
        <TitleSmall>
          We&apos;re currently hiring for {jobsCountForDepartment} position{jobsCountForDepartment > 1 && 's'}
          {department !== 'All' && ` in ${department}`}:
        </TitleSmall>
      )}
      {jobsCount < 1 && <TitleSmall>There are currently no open positions.</TitleSmall>}

      {jobsCount > 0 && department.length > 0 && (
        <>
          <DropDown>
            <select onChange={handleDepartmentChange}>
              <option value="All" selected>
                All ({jobsCount})
              </option>
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department} ({jobsData[department].length})
                </option>
              ))}
            </select>
          </DropDown>
        </>
      )}

      {jobsCount > 0 && department === 'All'
        ? Object.keys(jobsData).map((deptName: string) => (
            <Section key={deptName} margin={'0 0 1.6rem'}>
              <SubTitle>{deptName}</SubTitle>
              {jobsData[deptName].map(({ absolute_url, title, location }, index) => (
                <LinkContainer key={index} href={absolute_url} target="_blank" rel="noopener nofollow noreferrer">
                  <b>{title}</b>
                  <i>{location.name}</i>
                  <SVG src="images/icons/arrowRight.svg" cacheRequests={true} />
                </LinkContainer>
              ))}
            </Section>
          ))
        : jobsCount > 0 && (
            <Section margin={'0 0 1.6rem'}>
              <SubTitle>{department}</SubTitle>
              {jobsData[department].map(({ absolute_url, title, location }, index) => (
                <LinkContainer key={index} href={absolute_url} target="_blank" rel="noopener nofollow noreferrer">
                  <b>{title}</b>
                  <i>{location.name}</i>
                  <SVG src="images/icons/arrowRight.svg" cacheRequests={true} />
                </LinkContainer>
              ))}
            </Section>
          )}

      <Section>
        <p>
          {jobsCount < 1 && 'Currently there are no open positions. Convinced you can contribute to Cow Protocol?'}
          {jobsCount > 0 && "Can't find the position you're looking for?"}{' '}
          <ExternalLink href={CONFIG.social.discord.url} target="_blank" rel="noopener nofollow">
            Get in touch
          </ExternalLink>
        </p>
      </Section>

      <Section>
        <Card>
          <h3>
            <span>💸</span> Refer a friend and earn 6,000 in USDC or USD!
          </h3>
          <p>
            Know someone who is not just looking for a job but for a great opportunity to grow? Refer them to us to earn
            $6,000 in USDC or USD.{' '}
            <Button
              variant={ButtonVariant.OUTLINE_LIGHT}
              paddingLR={4.2}
              marginTB={2.4}
              fontSize={1.8}
              href="/careers/refer-to-earn"
              label="Refer-to-Earn details"
            />
          </p>
        </Card>
      </Section>
    </>
  )
}
