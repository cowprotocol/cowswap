import React, { useState } from 'react'

import { Helmet } from 'react-helmet'

import {
  ChartWrapper,
  DirectorySection,
  ErrorRow,
  Section,
  SectionHeader,
  SectionTitleMeta,
  SectionTitle,
  SnapshotAccordion,
  SnapshotContent,
  StyledSearch,
  Subtitle,
  ToggleButton,
  Wrapper,
} from './Solvers.styles'
import { SolversDirectoryTable } from './SolversDirectoryTable'

import { LoadingWrapper } from '../../components/common/LoadingWrapper'
import { useSolversInfo } from '../../hooks/useSolversInfo'
import { APP_TITLE } from '../const'

const Solvers = (): React.ReactNode => {
  const { solversInfo, isLoading, error } = useSolversInfo()
  const [isSnapshotExpanded, setIsSnapshotExpanded] = useState(true)
  const [shownCount, setShownCount] = useState(0)

  return (
    <Wrapper>
      <Helmet>
        <title>Solvers - {APP_TITLE}</title>
      </Helmet>
      <StyledSearch />
      <h1>Solvers</h1>
      <Subtitle>
        Discover solver teams, supported networks, environments, and deployment addresses sourced from CMS. Expand any
        solver row for per-network payout details.
      </Subtitle>
      <Section>
        <SnapshotAccordion $expanded={isSnapshotExpanded}>
          <SectionHeader $expanded={isSnapshotExpanded} onClick={(): void => setIsSnapshotExpanded((state) => !state)}>
            <SectionTitle>Live activity snapshot</SectionTitle>
            <ToggleButton>{isSnapshotExpanded ? 'Hide chart' : 'Show chart'}</ToggleButton>
          </SectionHeader>
          {isSnapshotExpanded && (
            <SnapshotContent>
              <ChartWrapper>
                <iframe
                  src="https://dune.com/embeds/5931238/9574995"
                  title="Solvers across networks"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allow="clipboard-write"
                />
              </ChartWrapper>
            </SnapshotContent>
          )}
        </SnapshotAccordion>
      </Section>
      <DirectorySection>
        <SectionTitle>
          Solvers directory <SectionTitleMeta>({shownCount} shown)</SectionTitleMeta>
        </SectionTitle>
        {isLoading ? (
          <LoadingWrapper message="Loading solvers" />
        ) : error ? (
          <ErrorRow>{error}</ErrorRow>
        ) : (
          <SolversDirectoryTable solversInfo={solversInfo} onFilteredCountChange={setShownCount} />
        )}
      </DirectorySection>
    </Wrapper>
  )
}

export default Solvers
