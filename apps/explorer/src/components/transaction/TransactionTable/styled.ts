import styled from 'styled-components'

import { media } from 'theme/styles/media'
import StyledUserDetailsTable from '../../common/StyledUserDetailsTable'

export const WrapperUserDetailsTable = styled(StyledUserDetailsTable)`
  > thead > tr,
  > tbody > tr {
    grid-template-columns: 12rem 5.5rem repeat(2, minmax(16rem, 1.5fr)) minmax(18rem, 2fr) 10rem minmax(21.6rem, 2fr) 1.36fr;
  }
  tr > td {
    span.span-inside-tooltip {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      img {
        padding: 0;
      }
    }
  }
  ${media.desktopMediumDown} {
    > thead > tr {
      display: none;
    }
    > tbody > tr {
      grid-template-columns: none;
      border: 0.1rem solid ${({ theme }): string => theme.tableRowBorder};
      box-shadow: 0px 4px 12px ${({ theme }): string => theme.boxShadow};
      border-radius: 6px;
      margin-top: 16px;
      padding: 12px;
      &:hover {
        background: none;
        backdrop-filter: none;
      }
    }
    tr > td {
      display: flex;
      flex: 1;
      width: 100%;
      justify-content: space-between;
      margin: 0;
      margin-bottom: 18px;
      min-height: 32px;
      span.span-inside-tooltip {
        align-items: flex-end;
        flex-direction: column;
        img {
          margin-left: 0;
        }
      }
    }
    .header-value {
      flex-wrap: wrap;
      text-align: end;
    }
    .span-copybtn-wrap {
      display: flex;
      flex-wrap: nowrap;
      span {
        display: flex;
        align-items: center;
      }
      .copy-text {
        margin-left: 5px;
      }
    }
  }
  overflow: auto;
`

export const HeaderTitle = styled.span`
  display: none;
  ${media.desktopMediumDown} {
    font-weight: 600;
    align-items: center;
    display: flex;
    margin-right: 3rem;
    svg {
      margin-left: 5px;
    }
  }
`
export const HeaderValue = styled.span`
  ${media.desktopMediumDown} {
    flex-wrap: wrap;
    text-align: end;
  }
`
