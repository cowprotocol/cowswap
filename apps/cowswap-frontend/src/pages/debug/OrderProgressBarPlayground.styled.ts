import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

const COLORS = {
  panelShadow: '0 14px 40px rgba(16, 43, 92, 0.12)',
  accent: '#234c9b',
  accentDark: '#173879',
  backendBg: '#e8efff',
  backendText: '#234c9b',
  progressBg: '#e5f4eb',
  progressText: '#1f6b44',
} as const

export const Page = styled.div`
  max-width: 1120px;
  margin: 0 auto;
  padding: 32px 24px 64px;
  color: var(${UI.COLOR_TEXT});
`

export const Header = styled.div`
  margin-bottom: 24px;
`

export const Title = styled.h1`
  margin: 0 0 8px;
  font-size: 28px;
  color: var(${UI.COLOR_TEXT});
`

export const Description = styled.p`
  margin: 0;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  line-height: 1.5;
`

export const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: end;
  margin-bottom: 24px;
`

export const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 280px;
  font-weight: 600;
  color: var(${UI.COLOR_TEXT});
`

export const Select = styled.select`
  appearance: none;
  min-height: 44px;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid var(${UI.COLOR_BORDER});
  background: var(${UI.COLOR_PAPER});
  color: var(${UI.COLOR_TEXT});
  box-shadow: 0 4px 12px rgba(35, 76, 155, 0.08);
`

export const ReplayButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 18px;
  border: 0;
  border-radius: 12px;
  background: ${COLORS.accent};
  color: white;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 10px 20px rgba(35, 76, 155, 0.24);

  &:hover {
    background: ${COLORS.accentDark};
  }
`

export const Layout = styled.div`
  display: grid;
  gap: 24px;
  align-items: start;
  grid-template-columns: minmax(320px, 520px) minmax(280px, 1fr);

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`

export const PreviewCard = styled.div`
  padding: 24px;
  border-radius: 24px;
  background: var(${UI.COLOR_PAPER});
  border: 1px solid var(${UI.COLOR_BORDER});
  box-shadow: ${COLORS.panelShadow};
`

export const MetaCard = styled.div`
  padding: 20px;
  border-radius: 20px;
  background: var(${UI.COLOR_PAPER});
  border: 1px solid var(${UI.COLOR_BORDER});
  box-shadow: ${COLORS.panelShadow};
`

export const MetaTitle = styled.h2`
  margin: 0 0 12px;
  font-size: 18px;
  color: var(${UI.COLOR_TEXT});
`

export const MetaRow = styled.div`
  margin-bottom: 12px;
  color: var(${UI.COLOR_TEXT});
  line-height: 1.5;
`

export const CurrentStatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`

export const CurrentStatusCard = styled.div`
  padding: 14px 16px;
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(35, 76, 155, 0.08), var(${UI.COLOR_PAPER}));
  border: 1px solid var(${UI.COLOR_BORDER});
`

export const CurrentStatusLabel = styled.div`
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
`

export const CurrentStatusValue = styled.div`
  display: inline-flex;
  align-items: center;
  min-height: 38px;
  padding: 0 14px;
  border-radius: 999px;
  background: ${COLORS.accent};
  color: white;
  font-size: 20px;
  font-weight: 700;
  box-shadow: 0 8px 18px rgba(35, 76, 155, 0.22);
`

export const Timeline = styled.ol`
  margin: 0;
  padding-left: 20px;
  display: grid;
  gap: 10px;
`

export const TimelineItem = styled.li<{ $active: boolean }>`
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid ${({ $active }) => ($active ? COLORS.accent : `var(${UI.COLOR_BORDER})`)};
  background: ${({ $active }) =>
    $active ? `linear-gradient(180deg, rgba(35, 76, 155, 0.08), var(${UI.COLOR_PAPER}))` : `var(${UI.COLOR_PAPER})`};
  color: ${({ $active }) => ($active ? `var(${UI.COLOR_TEXT})` : `var(${UI.COLOR_TEXT_OPACITY_70})`)};
  box-shadow: ${({ $active }) => ($active ? '0 12px 24px rgba(35, 76, 155, 0.16)' : 'none')};
`

export const TimelineHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
`

export const TimelineTitle = styled.div`
  font-weight: 700;
  color: var(${UI.COLOR_TEXT});
`

export const TimelineCurrentBadge = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: ${COLORS.accent};
  color: white;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
`

export const TimelineStatuses = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`

export const TimelineStatusPill = styled.span<{ $variant: 'backend' | 'progress' }>`
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  background: ${({ $variant }) => ($variant === 'backend' ? COLORS.backendBg : COLORS.progressBg)};
  color: ${({ $variant }) => ($variant === 'backend' ? COLORS.backendText : COLORS.progressText)};
  font-size: 14px;
  font-weight: 700;
`

export const TimelineStatusLabel = styled.span`
  margin-right: 6px;
  opacity: 0.72;
`
