import styled from 'styled-components/macro'

import { AccountElement } from 'legacy/components/Header/styled'

import { SetRecipient } from 'modules/swap/containers/SetRecipient'
import { Wrapper as AccountWrapper } from 'modules/wallet/pure/Web3StatusInner/styled'
import { Web3StatusConnect } from 'modules/wallet/pure/Web3StatusInner/styled'

import { UI } from 'common/constants/theme'

export const Container = styled.div`
  width: 100%;
  max-width: ${({ theme }) => theme.appBody.maxWidth.swap};
  margin: 0 auto;
`

export const ContainerBox = styled.div`
  display: flex;
  flex-flow: column wrap;
  gap: 10px;
  background: var(${UI.COLOR_CONTAINER_BG_01});
  border: none;
  border-radius: var(${UI.BORDER_RADIUS_NORMAL});
  box-shadow: ${({ theme }) => theme.boxShadow1};
  padding: 10px;
  position: relative;
`

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.isInjectedWidgetMode ? '0 7px 0 0' : '0 5px 0 0'};
  margin: 0;

  ${AccountElement} {
    margin: 0 10px 0 auto;
    border: 0;
  }

  ${AccountElement} > ${AccountWrapper} {
    height: initial;
  }

  ${AccountElement} ${Web3StatusConnect} {
    margin: 0;
    padding: 6px 12px;
    background: 0;
    border: 0;
    font-size: 14px;
    font-weight: var(${UI.FONT_WEIGHT_MEDIUM});
    color: var(${UI.COLOR_TEXT1});
    transition: all 0.2s ease-in-out;
    gap: 6px;
    opacity: 0.7;

    &:hover {
      background: var(${UI.COLOR_GREY});
    }

    > svg {
      --size: var(${UI.ICON_SIZE_SMALL});
      height: var(--size);
      width: var(--size);
      margin: 0;
    }

    > svg > path {
      fill: var(${UI.COLOR_TEXT1});
    }
  }
`

export const CurrencySeparatorBox = styled.div<{ withRecipient: boolean; compactView: boolean }>`
  display: flex;
  justify-content: space-between;
  margin: ${({ compactView }) => (compactView ? '-5px 0' : '0')};
  padding: ${({ withRecipient }) => (withRecipient ? '0 10px' : '0')};
`

export const StyledRemoveRecipient = styled(SetRecipient)`
  margin: 15px 0;
`
