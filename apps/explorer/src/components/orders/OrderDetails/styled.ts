import { Color, Media } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import ExplorerTabs from '../../../explorer/components/common/ExplorerTabs/ExplorerTabs'
import { RowWithCopyButton } from '../../common/RowWithCopyButton'

export const TitleUid = styled(RowWithCopyButton)`
  color: ${Color.explorer_grey};
  font-size: var(--font-size-default);
  font-weight: var(--font-weight-normal);
  margin: 0 0 0 1rem;
  display: flex;
  align-items: center;
`

export const WrapperExtraComponents = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  height: 100%;
  gap: 1rem;

  ${Media.upToSmall()} {
    width: 100%;
  }
`

export const StyledExplorerTabs = styled(ExplorerTabs)`
  margin-top: 2rem;

  &.orderDetails-tab {
    &--overview {
      .tab-content {
        padding: 0;
      }
    }
  }
`

export const TabContent = styled.span`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`

export const BridgeDetailsWrapper = styled.div`
  margin-top: 2rem;
`
