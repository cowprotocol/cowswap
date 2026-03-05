import React, { useMemo, useState } from 'react'

import { Helmet } from 'react-helmet'
import { useLocation } from 'react-router'

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
import { NETWORK_PREFIXES } from '../../state/network/const'
import { APP_TITLE } from '../const'

const SOLVERS_DUNE_EMBED_URL = 'https://dune.com/embeds/5931238/9574995?darkMode=true'
const SOLVERS_CANONICAL_URL = 'https://explorer.cow.fi/solvers'
const SOLVER_DEEPLINK_QUERY_PARAM = 'solver'

function getSolverDeeplinkFromSearch(search: string): string | null {
  const solver = new URLSearchParams(search).get(SOLVER_DEEPLINK_QUERY_PARAM)
  return solver?.trim() || null
}

const Solvers = (): React.ReactNode => {
  const { solversInfo, isLoading, error } = useSolversInfo()
  const [isSnapshotExpanded, setIsSnapshotExpanded] = useState(true)
  const [shownCount, setShownCount] = useState(0)
  const { pathname, search } = useLocation()
  const [, firstPathSegment, secondPathSegment] = pathname.split('/')
  const isPrefixedSolversPath =
    firstPathSegment.length > 0 &&
    NETWORK_PREFIXES.split('|').includes(firstPathSegment) &&
    secondPathSegment === 'solvers'
  const solverDeeplink = useMemo(() => getSolverDeeplinkFromSearch(search), [search])

  return (
    <Wrapper>
      <Helmet>
        <title>Solvers - {APP_TITLE}</title>
        <link rel="canonical" href={SOLVERS_CANONICAL_URL} />
        {isPrefixedSolversPath && <meta name="robots" content="noindex,follow" />}
      </Helmet>
      <StyledSearch />
      <h1>Solvers</h1>
      <Subtitle>
        Discover solver teams, supported networks, environments, and deployment addresses. Expand any solver row for
        per-network payout details.
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
                  src={SOLVERS_DUNE_EMBED_URL}
                  title="Solvers across networks"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allow="clipboard-write"
                  sandbox="allow-scripts allow-same-origin"
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
          <SolversDirectoryTable
            solversInfo={solversInfo}
            onFilteredCountChange={setShownCount}
            solverDeeplink={solverDeeplink}
          />
        )}
      </DirectorySection>
    </Wrapper>
  )
}

export default Solvers
