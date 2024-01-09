import React, { Context, useContext } from 'react'
import styled, { css } from 'styled-components'
import { faChevronRight, faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { media } from 'theme/styles/media'
import { Dropdown, DropdownOption } from 'apps/explorer/components/common/Dropdown'

const PaginationTextCSS = css`
  color: ${({ theme }): string => theme.textPrimary1};
  font-size: ${({ theme }): string => theme.fontSizeDefault};
  font-weight: normal;
  white-space: nowrap;
`

export const PaginationWrapper = styled.span`
  ${PaginationTextCSS}
  align-items: center;
  display: flex;
  justify-content: center;
  padding-right: 1.5rem;
`

const PaginationText = styled.p`
  margin-right: 0.8rem;
  &.legend {
    margin-left: 2rem;
  }
  ${media.mediumDown} {
    &:not(.legend) {
      display: none;
    }
  }
`

const PaginationItem = styled(DropdownOption)`
  align-items: center;
  cursor: pointer;
  height: 32px;
  line-height: 1.2;
  padding: 0 1rem;
  white-space: nowrap;
`

const Icon = styled(FontAwesomeIcon)`
  width: 2rem !important;
  height: 2rem;
  color: ${({ theme }): string => theme.textSecondary1};
  .fill {
    color: ${({ theme }): string => theme.textActive1};
  }
`
const PaginationButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  justify-content: center;
  height: auto;
  outline: none;
  padding: 0;
  user-select: none;
  width: 3.5rem;
  white-space: nowrap;

  &:hover {
    .fill {
      color: ${({ theme }): string => theme.textActive1};
    }
  }

  &[disabled],
  &[disabled]:hover {
    cursor: not-allowed;
    opacity: 0.5;
    .fill {
      color: ${({ theme }): string => theme.textSecondary1};
    }
  }
`
PaginationButton.defaultProps = { disabled: true }

const DropdownPagination = styled(Dropdown)`
  .dropdown-options {
    min-width: 60px;
  }
`
const PaginationDropdownButton = styled.button`
  ${PaginationTextCSS}
  background: none;
  border: none;
  white-space: nowrap;
  cursor: pointer;
  &.selected {
    background-color: transparent;
    cursor: not-allowed;
    opacity: 0.5;
    pointer-events: none;
  }
  &:hover span {
    color: ${({ theme }): string => theme.textActive1};
  }
`

const quantityPerPage = [10, 20, 30, 50]

type PaginationProps<T> = {
  context: Context<T>
  fixedResultsPerPage?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TablePagination: React.FC<PaginationProps<any>> = ({ context, fixedResultsPerPage }) => {
  const {
    isLoading,
    tableState: { pageSize, pageOffset, hasNextPage, pageIndex, totalResults = -1 },
    setPageSize,
    handleNextPage,
    handlePreviousPage,
    data: rows,
  } = useContext(context)

  const renderPageLegend = (): string => {
    if (isLoading && !rows?.length) return '.. - ..'

    let startPageCount = 0
    let endPageCount = 0
    if (rows?.length) {
      startPageCount = pageOffset + 1
      endPageCount = pageOffset + rows.length
    }

    if (totalResults >= 0) {
      return `Page ${!totalResults ? 0 : pageIndex} of ${Math.ceil(totalResults / pageSize)}`
    }
    return `${startPageCount} - ${endPageCount}`
  }
  const hasPreviousPage = !isLoading && pageOffset > 0

  return (
    <PaginationWrapper>
      {!fixedResultsPerPage && (
        <>
          <PaginationText>Rows per page:</PaginationText>
          <DropdownPagination
            disabled={isLoading}
            dropdownButtonContent={
              <PaginationDropdownButton>
                {pageSize} <span>▼</span>
              </PaginationDropdownButton>
            }
            dropdownButtonContentOpened={
              <PaginationDropdownButton className="selected">{pageSize} ▲</PaginationDropdownButton>
            }
            currentItem={quantityPerPage.findIndex((option) => option === pageSize)}
            items={quantityPerPage.map((pageOption) => (
              <PaginationItem key={pageOption} onClick={(): void => setPageSize(pageOption)}>
                {pageOption}
              </PaginationItem>
            ))}
          />
        </>
      )}
      <PaginationText className="legend">{renderPageLegend()}</PaginationText>{' '}
      <PaginationButton disabled={!hasPreviousPage} onClick={handlePreviousPage}>
        <Icon icon={faChevronLeft} className="fill" />
      </PaginationButton>
      <PaginationButton disabled={!hasNextPage} onClick={handleNextPage}>
        <Icon icon={faChevronRight} className="fill" />
      </PaginationButton>
    </PaginationWrapper>
  )
}

export default TablePagination
