import { Media, UI } from '@cowprotocol/ui'

import { transparentize } from 'color2k'
import styled from 'styled-components/macro'
import { WIDGET_MAX_WIDTH } from 'theme'

import { AddressLink } from 'common/pure/AddressLink'

export const EmptyWrapper = styled.div<{ $modalMode: boolean }>`
  width: 100%;
`

export const ModalWrapper = styled.div<{ $modalMode: boolean }>`
  position: ${({ $modalMode }) => ($modalMode ? 'fixed' : 'static')};
  width: 100%;
  height: 100%;
  z-index: 100;
  left: 0;
  top: 0;
  overflow-y: scroll;
  padding: 50px 0;
  background: ${({ theme }) => (theme.isWidget ? 'transparent' : transparentize(theme.black, 0.5))};
  backdrop-filter: blur(3px);

  ${Media.upToSmall()} {
    padding: 0;
  }
`

export const WidgetWrapper = styled.div`
  width: 100%;
  max-width: ${WIDGET_MAX_WIDTH.swap};
  margin: 0 auto;
  position: relative;

  p {
    padding: 0.8rem 0 0.8rem 0;
  }

  li {
    padding: 0.3rem;
  }
`

export const AddressLinkStyled = styled(AddressLink)`
  color: inherit;
  width: 100%;
  font-size: 14px;
  background: var(${UI.COLOR_PAPER});
  border-radius: 16px;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  word-break: break-all;
`

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 20px;
  background: var(${UI.COLOR_PAPER_DARKER});
  border-radius: 16px;

  p {
    text-align: center;
  }
`

export const Title = styled.div`
  font-size: 24px;
  font-weight: 600;
  margin: 5px 0;
`

export const FAQWrapper = styled.div`
  display: flex;
  flex-flow: column wrap;
  align-items: flex-start;
  gap: 10px;
  margin: 24px 0 0;
  width: 100%;
`

export const FAQItem = styled.details`
  display: flex;
  flex-flow: column wrap;
  width: 100%;
  margin: 0 auto;
  padding: 0;
  line-height: 1;
  position: relative;
  border-radius: ${({ open }) => (open ? '32px' : '56px')};

  > summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    margin: 0;
    padding: 8px 8px 8px 10px;
    list-style-type: none;
    line-height: 1.2;
    font-weight: 600;
    font-size: 16px;

    &::marker,
    &::-webkit-details-marker {
      display: none;
    }

    > i {
      --size: 26px;
      width: var(--size);
      height: var(--size);
      min-height: var(--size);
      min-width: var(--size);
      border-radius: var(--size);
      background: transparent;
      transition: background 0.2s ease-in-out;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        background: ${({ theme }) => theme.bg3};
      }

      > svg {
        width: 100%;
        height: 100%;
        padding: 0;
        fill: currentColor;
      }
    }
  }

  > div {
    padding: 0 21px 21px;
    font-size: 15px;
    line-height: 1.8;
    color: var(${UI.COLOR_TEXT_OPACITY_70});
  }

  > div > ol {
    margin: 0;
    padding: 0 0 0 20px;
  }
`
