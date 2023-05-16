import styled from 'styled-components/macro'
import { usePaginationContext } from '../../hooks/usePagination'
import { Trans } from '@lingui/macro'

const ArrowButton = styled.button`
  background: none;
  border: none;
`

const Arrow = styled.div<{ faded: boolean }>`
  color: ${({ theme }) => theme.text1};
  opacity: ${(props) => (props.faded ? 0.3 : 1)};
  padding: 0 10px;
  user-select: none;

  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
    padding: 5px;
  `};

  ${({ faded }) =>
    !faded &&
    `
    :hover {
      cursor: pointer;
    }
  `}
`

export const PageButtons = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 24px auto;
`

export const PaginationText = styled.span`
  font-size: 13px;
  white-space: nowrap;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    font-size: 15px;
  `};
`

export function PaginationButtons() {
  const { setPage, prevPage, page, maxPage, nextPage } = usePaginationContext()
  return (
    <PageButtons>
      <ArrowButton onClick={() => setPage(1)}>
        <Arrow faded={page === 1}>{'<<'}</Arrow>
      </ArrowButton>

      <ArrowButton onClick={() => setPage(prevPage)}>
        <Arrow faded={page === 1}>←</Arrow>
      </ArrowButton>

      <PaginationText>
        <Trans>{'Page ' + page + ' of ' + maxPage}</Trans>
      </PaginationText>

      <ArrowButton onClick={() => setPage(nextPage)}>
        <Arrow faded={page === maxPage}>→</Arrow>
      </ArrowButton>

      <ArrowButton onClick={() => setPage(maxPage)}>
        <Arrow faded={page === maxPage}>{'>>'}</Arrow>
      </ArrowButton>
    </PageButtons>
  )
}
