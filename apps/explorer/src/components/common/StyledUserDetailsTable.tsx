import { SimpleTable, Props as SimpleTableProps } from 'components/common/SimpleTable'
import styled from 'styled-components/macro'

export interface Props {
  showBorderTable?: boolean
}

export type StyledUserDetailsTableProps = SimpleTableProps & Props

const StyledUserDetailsTable = styled(SimpleTable)<StyledUserDetailsTableProps>`
  border: ${({ theme, showBorderTable }): string => (showBorderTable ? `0.1rem solid ${theme.borderPrimary}` : 'none')};
  border-radius: 0.4rem;
  margin-top: 0;

  tr td {
    &:not(:first-of-type) {
      text-align: left;
    }

    &.long {
      border-left: 0.2rem solid var(--color-long);
    }

    &.short {
      color: var(--color-short);
      border-left: 0.2rem solid var(--color-short);
    }
  }

  thead tr th {
    color: ${({ theme }): string => theme.textPrimary1};
    font-style: normal;
    font-weight: ${({ theme }): string => theme.fontBold};
    font-size: 13px;
    line-height: 16px;
    height: 50px;
    border-bottom: ${({ theme }): string => `1px solid ${theme.borderPrimary}`};
  }

  thead tr th > span {
    white-space: pre;
  }

  thead {
    position: inherit;
  }

  thead tr {
    width: 100%;
  }

  tbody {
    overflow: unset;
  }

  tbody tr:hover {
    background-color: ${({ theme }): string => theme.bg3};
  }

  .span-copybtn-wrap {
    display: block;
  }

  span.wrap-datedisplay > span:last-of-type {
    display: flex;
  }

  tbody tr td.row-td-empty {
    grid-column: 1 / span all;

    :hover {
      background-color: ${({ theme }): string => theme.bg1};
    }
  }

  tbody tr.row-empty {
    padding: 0;
  }
`

export const EmptyItemWrapper = styled.div`
  color: ${({ theme }): string => theme.textPrimary1};
  height: 100%;
  min-height: 15rem;
  align-items: center;
  justify-content: center;
  display: flex;
  width: 100%;
  font-size: ${({ theme }): string => theme.fontSizeDefault};
  text-align: center;
`

export default StyledUserDetailsTable
