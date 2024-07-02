import { Media } from '@cowprotocol/ui'

import styled from 'styled-components/macro'
import { WIDGET_MAX_WIDTH } from 'theme'

export const PageWrapper = styled.div<{ isUnlocked: boolean }>`
  width: 100%;
  display: grid;
  max-width: 1500px;
  margin: 0 auto;
  grid-template-columns: ${({ isUnlocked }) => (isUnlocked ? WIDGET_MAX_WIDTH.swap : '')} 1fr;
  grid-template-rows: max-content;
  grid-column-gap: 20px;

  ${Media.upToLarge()} {
    display: flex;
    flex-flow: column wrap;
  }

  > div:last-child {
    display: ${({ isUnlocked }) => (isUnlocked ? '' : 'none')};
  }
`
// Form + banner
export const PrimaryWrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  gap: 16px;
  width: 100%;
  max-width: ${WIDGET_MAX_WIDTH.swap};
  margin: 0 auto;
  color: inherit;
`

// Graph + orders table
export const SecondaryWrapper = styled.div`
  display: flex;
  width: 100%;
  overflow: hidden;

  ${Media.upToLargeAlt()} {
    flex-flow: column wrap;
    margin: 56px 0;
  }
`
