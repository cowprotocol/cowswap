import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'
import { WIDGET_MAX_WIDTH } from 'theme'

export const Wrapper = styled.div`
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

  .noFunds {
    color: var(${UI.COLOR_ALERT_TEXT});
    background: var(${UI.COLOR_ALERT_BG});
    padding: 10px;
    border-radius: 16px;
  }
`

export const ProxyInfo = styled.div`
  display: flex;
  flex-flow: column wrap;
  gap: 10px;
  margin: 0;
  text-align: center;
  font-size: 15px;

  > h4 {
    font-size: 16px;
    font-weight: 600;
    margin: 0 auto;
  }

  > a {
    color: inherit;
    width: 100%;
  }

  > a > span {
    font-size: 100%;
    background: var(${UI.COLOR_PAPER});
    border-radius: 16px;
    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    margin: 0 auto;
    word-break: break-all;
  }
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
  margin: 10px 0;
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
