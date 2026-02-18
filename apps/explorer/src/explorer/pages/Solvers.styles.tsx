import { Color, Media } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { StyledSearch, Wrapper as WrapperMod } from './styled'

export const Wrapper = styled(WrapperMod)`
  max-width: 140rem;

  > h1 {
    font-size: 3.4rem;
    line-height: 1.05;
  }

  > ${StyledSearch} {
    margin-bottom: 2rem;
  }
`

export const Subtitle = styled.p`
  margin: 0 0 2.4rem;
  color: ${Color.explorer_textSecondary1};
  font-size: 1.45rem;
  line-height: 1.4;
`

export const SectionTitle = styled.h2`
  margin: 0 0 1.2rem;
  font-size: 2rem;
  line-height: 1;
  display: block;
`

export const SectionTitleMeta = styled.span`
  color: ${Color.explorer_textSecondary2};
  font-size: 16px;
`

export const Section = styled.section`
  margin: 3.6rem 0;
`

export const DirectorySection = styled(Section)`
  margin-top: 4.8rem;
`

export const SnapshotAccordion = styled.div<{ $expanded: boolean }>`
  border: 0.1rem solid ${Color.explorer_border};
  border-radius: 1rem;
  overflow: hidden;
  background: linear-gradient(180deg, ${Color.explorer_bg2} 0%, rgba(16, 21, 39, 0.15) 100%);
  box-shadow: ${({ $expanded }): string => ($expanded ? '0 0.6rem 2.4rem rgba(0, 0, 0, 0.18)' : 'none')};
`

export const SectionHeader = styled.button<{ $expanded: boolean }>`
  width: 100%;
  border: 0;
  appearance: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 5.4rem;
  padding: 0 1.2rem;
  text-align: left;
  color: ${Color.neutral100};
  border-bottom: 0.1rem solid ${({ $expanded }): string => ($expanded ? Color.explorer_border : 'transparent')};

  > ${SectionTitle} {
    margin: 0;
    line-height: 1.1;
    color: inherit;
  }
`

export const ToggleButton = styled.span`
  border: 0.1rem solid ${Color.explorer_border};
  background: ${Color.explorer_greyOpacity};
  color: ${Color.neutral100};
  border-radius: 0.7rem;
  padding: 0.45rem 0.9rem;
  font-size: 1.2rem;
  line-height: 1;
`

export const SnapshotContent = styled.div`
  padding: 0.8rem;
`

export const ChartWrapper = styled.div`
  width: 100%;
  border: 0.1rem solid rgba(255, 255, 255, 0.06);
  border-radius: 0.6rem;
  overflow: hidden;

  > iframe {
    width: 100%;
    min-height: 50rem;
    border: 0;
  }

  ${Media.upToSmall()} {
    > iframe {
      min-height: 36rem;
    }
  }
`

export const ErrorRow = styled.div`
  border: 0.1rem solid ${Color.alert2};
  color: ${Color.alert2};
  padding: 1.2rem;
  border-radius: 0.6rem;
`

export const Placeholder = styled.span`
  color: ${Color.explorer_textSecondary2};
`

export { StyledSearch }
