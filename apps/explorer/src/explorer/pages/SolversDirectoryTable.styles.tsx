import { Color, Media } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { SimpleTable } from '../../components/common/SimpleTable'

const DEPLOYMENTS_GRID_TEMPLATE_COLUMNS = '12rem 8rem 1fr 1fr'
const DEPLOYMENTS_GRID_MIN_WIDTH = '72rem'

type EnvTagPalette = {
  color: string
  background: string
  border: string
}

const DEFAULT_ENV_TAG_PALETTE: EnvTagPalette = {
  color: Color.explorer_orange1,
  background: Color.explorer_orangeOpacity,
  border: Color.explorer_orange1,
}

const ENV_TAG_PALETTE_MAP: Record<string, EnvTagPalette> = {
  prod: {
    color: Color.explorer_green1,
    background: Color.explorer_greenOpacity,
    border: Color.explorer_green1,
  },
  barn: DEFAULT_ENV_TAG_PALETTE,
}

function getEnvTagPalette(environment: string): EnvTagPalette {
  return ENV_TAG_PALETTE_MAP[environment] || DEFAULT_ENV_TAG_PALETTE
}

export const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 1.4rem 0 1.6rem;
  align-items: center;
`

export const SearchInputWrapper = styled.div`
  position: relative;
  min-width: 26rem;
  flex: 1 1 32rem;
`

export const Input = styled.input`
  width: 100%;
  border: 0.1rem solid ${Color.explorer_border};
  border-radius: 0.8rem;
  background: ${Color.explorer_bg2};
  color: ${Color.explorer_textSecondary2};
  padding: 0.95rem 3.8rem 0.95rem 1.1rem;

  &::placeholder {
    color: ${Color.explorer_textSecondary2};
    opacity: 1;
  }
`

export const ClearInputButton = styled.button`
  position: absolute;
  top: 50%;
  right: 1rem;
  transform: translateY(-50%);
  border: 0;
  background: transparent;
  color: ${Color.explorer_textSecondary2};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  width: 2.2rem;
  height: 2.2rem;
  padding: 0;
  border-radius: 50%;

  &:hover {
    color: ${Color.neutral100};
    background: ${Color.explorer_bg};
  }
`

export const Select = styled.select`
  min-width: 16rem;
  border: 0.1rem solid ${Color.explorer_border};
  border-radius: 0.8rem;
  background: ${Color.explorer_bg2};
  color: ${Color.neutral100};
  padding: 0.95rem 1.1rem;
`

export const Table = styled(SimpleTable)`
  min-width: 98rem;

  td.solver {
    min-width: 28rem;
  }

  td.networks {
    min-width: 32rem;
    white-space: normal;
  }

  td.envs {
    min-width: 16rem;
  }

  td.website {
    min-width: 11rem;
  }

  td.description {
    min-width: 18rem;
    white-space: normal;
  }

  ${Media.upToMedium()} {
    min-width: 92rem;
  }
`

export const TableScrollHint = styled.div`
  position: relative;

  ${Media.upToMedium()} {
    &::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      bottom: 2rem;
      width: 2.8rem;
      pointer-events: none;
      background: linear-gradient(to left, rgba(0, 0, 0, 0.72), rgba(0, 0, 0, 0));
    }
  }
`

export const SolverCell = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`

export const SolverLogo = styled.img`
  width: 3.2rem;
  height: 3.2rem;
  object-fit: contain;
  border-radius: 50%;
  border: 0.1rem solid ${Color.explorer_border};
  background: ${Color.neutral100};
`

export const SolverLogoFallback = styled.div`
  width: 3.2rem;
  height: 3.2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0.1rem solid ${Color.explorer_border};
  color: ${Color.neutral100};
  font-weight: 700;
`

export const SolverDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
`

export const SolverId = styled.span`
  color: ${Color.explorer_textSecondary2};
  font-size: 1.2rem;
`

export const ExpandButton = styled.button`
  border: 0.1rem solid ${Color.explorer_border};
  background: ${Color.explorer_bg2};
  color: ${Color.neutral100};
  border-radius: 0.6rem;
  min-width: 2.4rem;
  height: 2.4rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.6rem;
  cursor: pointer;
  font-size: 1.2rem;
`

export const Networks = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
`

export const NetworkChip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: 0.1rem solid ${Color.explorer_border};
  border-radius: 999rem;
  padding: 0.2rem 0.4rem;
  background: ${Color.explorer_bg2};
  font-size: 1.2rem;
`

export const EnvTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
`

export const EnvTag = styled.span<{ $environment: string }>`
  padding: 0.2rem 0.6rem;
  border-radius: 0.4rem;
  font-size: 1.2rem;
  font-weight: 600;
  text-transform: lowercase;
  color: ${({ $environment }): string => getEnvTagPalette($environment).color};
  background: ${({ $environment }): string => getEnvTagPalette($environment).background};
  border: 0.1rem solid ${({ $environment }): string => getEnvTagPalette($environment).border};
`

export const NetworkIcon = styled.img<{ $invert?: boolean }>`
  width: 1.35rem;
  height: 1.35rem;
  object-fit: contain;
  filter: ${({ $invert }): string => ($invert ? 'invert(1)' : 'none')};
`

export const DeploymentsPanel = styled.div`
  padding: 1rem;
  border: 0.1rem solid ${Color.explorer_border};
  border-radius: 0.8rem;
  background: ${Color.explorer_bg2};
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
`

export const DeploymentsPanelTitle = styled.h3`
  margin: 0 0 1.4rem;
  font-size: 1.3rem;
  color: ${Color.explorer_textSecondary1};
`

export const DeploymentsSection = styled.div<{ $muted?: boolean }>`
  border-radius: 0.8rem;
  padding: 0.8rem;
  background: ${({ $muted }): string => ($muted ? 'transparent' : Color.explorer_bg)};
  border: ${({ $muted }): string =>
    $muted ? `0.1rem solid ${Color.explorer_tableRowBorder}` : `0.1rem solid ${Color.explorer_border}`};
  opacity: ${({ $muted }): number => ($muted ? 0.88 : 1)};

  &:not(:first-of-type) {
    margin-top: 1.6rem;
  }
`

export const DeploymentsSectionTitle = styled.h4<{ $muted?: boolean }>`
  margin: 0 0 0.6rem;
  font-size: 1.2rem;
  color: ${({ $muted }): string => ($muted ? Color.explorer_textSecondary2 : Color.neutral100)};
`

export const DeploymentsGridHeader = styled.div`
  display: grid;
  grid-template-columns: ${DEPLOYMENTS_GRID_TEMPLATE_COLUMNS};
  min-width: ${DEPLOYMENTS_GRID_MIN_WIDTH};
  gap: 0.8rem;
  color: ${Color.explorer_textSecondary2};
  font-size: 1.1rem;
  margin-bottom: 0.8rem;
`

export const DeploymentsGridRow = styled.div`
  display: grid;
  grid-template-columns: ${DEPLOYMENTS_GRID_TEMPLATE_COLUMNS};
  min-width: ${DEPLOYMENTS_GRID_MIN_WIDTH};
  gap: 0.8rem;
  padding: 0.6rem 0;
  border-top: 0.1rem solid ${Color.explorer_border};
  align-items: center;
  font-size: 1.2rem;

  > :nth-child(3),
  > :nth-child(4) {
    min-width: 22rem;
  }
`

export const DeploymentsEmpty = styled.span`
  display: inline-block;
  color: ${Color.explorer_textSecondary2};
  font-size: 1.2rem;
  padding: 0.2rem 0;
`

export const Mono = styled.span`
  font-family: var(--font-monospace);
  font-size: 1.1rem;
  word-break: break-all;
`
