import { transparentize } from 'polished'
import styled from 'styled-components/macro'
import { SORT_DIRECTION, SORT_FIELD } from '../../hooks/useSorting'
import { SortButton } from '../SortButton'

export const Label = styled.div<{ end?: number }>`
  display: flex;
  font-size: inherit;
  font-weight: 400;
  justify-content: ${({ end }) => (end ? 'flex-end' : 'flex-start')};
  color: ${({ theme }) => transparentize(0.1, theme.text1)};
  align-items: center;
  font-variant-numeric: tabular-nums;
  word-break: break-all;
  overflow: hidden;
  font-size: 13px;

  > span {
    display: flex;
    align-items: center;
    max-width: inherit;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  > span > b {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
    font-weight: 500;
    display: inline-block;
  }

  > span > i {
    opacity: 0.6;
    margin: 0 0 0 4px;
    font-style: normal;
    display: inline-block;
    text-transform: uppercase;
  }
`

export const Row = styled.div`
  width: 100%;
  display: grid;
  grid-gap: 16px;
  grid-template-columns: 62px 430px repeat(2, 100px) 1fr;
  padding: 16px;
  justify-content: flex-start;
  align-items: center;
  background: transparent;
  transition: background 0.2s ease-in-out;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: auto;
    grid-template-columns: 62px 330px repeat(2,150px) 200px;
  `}

  &:hover {
    background: ${({ theme }) => theme.grey1};
  }
`

export const Container = styled(Row)`
  border-bottom: 1px solid ${({ theme }) => theme.grey1};

  &:hover {
    background: transparent;
  }

  ${Label} {
    opacity: 0.75;
  }
`

export const IndexLabel = styled(Label)`
  padding: 0;
`

export const ClickableText = styled(Label)<{ disabled?: boolean }>`
  text-align: end;
  user-select: none;

  ${({ disabled }) =>
    !disabled &&
    `
    &:hover {
      cursor: pointer;
      opacity: 0.6;
    }
  `}
`

interface Field {
  label: string
  sortId?: SORT_FIELD
}

interface TableHeaderProps {
  fields: Field[]
  onSort: ({ field }: { field: SORT_FIELD }) => void
  sortDirection?: SORT_DIRECTION
  sortField?: SORT_FIELD
}

export function TableHeader({ fields, onSort, sortField, sortDirection }: TableHeaderProps) {
  return (
    <Container>
      <IndexLabel>#</IndexLabel>
      {fields.map(({ label, sortId }) => {
        if (sortId) {
          return (
            <ClickableText onClick={() => onSort({ field: sortId })}>
              {label} <SortButton isVisible={sortId === sortField} sortDirection={sortDirection} />
            </ClickableText>
          )
        } else {
          return <Label>{label}</Label>
        }
      })}
    </Container>
  )
}
