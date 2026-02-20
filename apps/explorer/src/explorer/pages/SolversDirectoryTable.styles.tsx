import { Color } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { SimpleTable } from '../../components/common/SimpleTable'

export const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 1.4rem 0 1.6rem;
  align-items: center;
`

export const Input = styled.input`
  min-width: 26rem;
  flex: 1 1 32rem;
  border: 0.1rem solid ${Color.explorer_border};
  border-radius: 0.8rem;
  background: ${Color.explorer_bg2};
  color: ${Color.explorer_textSecondary2};
  padding: 0.95rem 1.1rem;

  &::placeholder {
    color: ${Color.explorer_textSecondary2};
    opacity: 1;
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
  color: ${({ $environment }): string => ($environment === 'prod' ? Color.explorer_green1 : Color.explorer_orange1)};
  background: ${({ $environment }): string =>
    $environment === 'prod' ? Color.explorer_greenOpacity : Color.explorer_orangeOpacity};
  border: 0.1rem solid
    ${({ $environment }): string => ($environment === 'prod' ? Color.explorer_green1 : Color.explorer_orange1)};
`

export const NetworkIcon = styled.img`
  width: 1.35rem;
  height: 1.35rem;
  object-fit: contain;
`

export const DeploymentsPanel = styled.div`
  padding: 1rem;
  border: 0.1rem solid ${Color.explorer_border};
  border-radius: 0.8rem;
  background: ${Color.explorer_bg2};
`

export const DeploymentsPanelTitle = styled.h3`
  margin: 0 0 0.8rem;
  font-size: 1.3rem;
  color: ${Color.explorer_textSecondary1};
`

export const DeploymentsGridHeader = styled.div`
  display: grid;
  grid-template-columns: 12rem 8rem 1fr 1fr 6rem;
  gap: 0.8rem;
  color: ${Color.explorer_textSecondary2};
  font-size: 1.1rem;
  margin-bottom: 0.8rem;
`

export const DeploymentsGridRow = styled.div`
  display: grid;
  grid-template-columns: 12rem 8rem 1fr 1fr 6rem;
  gap: 0.8rem;
  padding: 0.6rem 0;
  border-top: 0.1rem solid ${Color.explorer_border};
  align-items: center;
  font-size: 1.2rem;
`

export const Mono = styled.span`
  font-family: var(--font-monospace);
  font-size: 1.1rem;
  word-break: break-all;
`
