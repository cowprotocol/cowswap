import styled from 'styled-components'
import { media } from 'theme/styles/media'

export const Wrapper = styled.div`
  display: grid;
  row-gap: 1rem;
  justify-items: start;
  align-items: center;
  grid-template-columns: 11rem auto;
  padding: 0;

  ${media.mobile} {
    display: flex;
    flex-flow: column wrap;
    align-items: flex-start;
  }
`

export const RowTitle = styled.span`
  display: flex;
  align-items: center;
  font-weight: ${({ theme }): string => theme.fontBold};

  ${media.mobile} {
    margin: 1rem 0 0;
  }

  &::before {
    content: '▶';
    margin-right: 0.5rem;
    color: ${({ theme }): string => theme.grey};
    font-size: 0.75rem;
  }
`

export const RowContents = styled.span`
  display: flex;
  align-items: center;
  flex-flow: wrap;

  & > span:first-child {
    margin: 0 0.5rem 0 0;
  }

  & > :not(:first-child) {
    margin: 0 0 0 0.5rem;
  }
`

export const UsdAmount = styled.span`
  color: ${({ theme }): string => theme.textPrimary1};
  opacity: 0.5;
`
