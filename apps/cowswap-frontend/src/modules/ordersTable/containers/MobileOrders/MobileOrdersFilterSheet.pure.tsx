import { useAtomValue } from 'jotai'
import { ChangeEvent, ReactNode, useEffect, useMemo, useState } from 'react'

import { BottomDrawer, CloseIconButton } from '@cowprotocol/ui'

import { useLingui } from '@lingui/react/macro'
import { OrderTabId } from 'entities/routes/routes.atom'
import { Search, X } from 'react-feather'

import * as styledEl from './MobileOrders.styled'

import { ordersTableStateAtom } from '../../state/ordersTable.atoms'
import { ordersTableTabIdAtom } from '../../state/params/ordersTableParams.atom'
import { getFilteredOrders, HistoryStatusFilter } from '../../utils/getFilteredOrders'

export interface MobileOrdersFilterSheetProps {
  isOpen: boolean
  searchTerm: string
  historyStatusFilter: HistoryStatusFilter
  onOpenChange(open: boolean): void
  onApply(searchTerm: string, historyStatusFilter: HistoryStatusFilter): void
}

interface FilterSheetFooterProps {
  canReset: boolean
  filteredCount: number
  onApply(): void
  onReset(): void
}

interface FilterStatusChoicesProps {
  value: HistoryStatusFilter
  onChange(value: HistoryStatusFilter): void
}

export function MobileOrdersFilterSheet({
  isOpen,
  searchTerm,
  historyStatusFilter,
  onOpenChange,
  onApply,
}: MobileOrdersFilterSheetProps): ReactNode {
  const { t } = useLingui()
  const { orders } = useAtomValue(ordersTableStateAtom)
  const currentTab = useAtomValue(ordersTableTabIdAtom)
  const [draftSearchTerm, setDraftSearchTerm] = useState(searchTerm)
  const [draftStatus, setDraftStatus] = useState(historyStatusFilter)

  useEffect(() => {
    if (!isOpen) return

    setDraftSearchTerm(searchTerm)
    setDraftStatus(historyStatusFilter)
  }, [historyStatusFilter, isOpen, searchTerm])

  const filteredCount = useMemo(
    () =>
      getFilteredOrders(orders, {
        searchTerm: draftSearchTerm,
        historyStatusFilter: currentTab === OrderTabId.HISTORY ? draftStatus : HistoryStatusFilter.ALL,
      }).length,
    [currentTab, draftSearchTerm, draftStatus, orders],
  )
  const canReset = draftSearchTerm.trim() !== '' || draftStatus !== HistoryStatusFilter.ALL

  const handleApply = (): void => {
    onApply(draftSearchTerm, draftStatus)
    onOpenChange(false)
  }

  const handleReset = (): void => {
    setDraftSearchTerm('')
    setDraftStatus(HistoryStatusFilter.ALL)
  }

  const header = (
    <styledEl.FilterSheetHeader>
      <h2>{t`Search & filters`}</h2>
      <CloseIconButton closeOnEscape={false} aria-label={t`Close filters`} onClick={() => onOpenChange(false)} />
    </styledEl.FilterSheetHeader>
  )

  return (
    <BottomDrawer
      open={isOpen}
      onOpenChange={onOpenChange}
      title={t`Search and filters`}
      nested
      header={header}
      footer={
        <FilterSheetFooter
          canReset={canReset}
          filteredCount={filteredCount}
          onApply={handleApply}
          onReset={handleReset}
        />
      }
    >
      <styledEl.FilterSheetBody>
        {currentTab === OrderTabId.HISTORY ? (
          <FilterStatusChoices value={draftStatus} onChange={setDraftStatus} />
        ) : null}

        <styledEl.FilterGroup>
          <label htmlFor="mobile-orders-search">{t`Token symbol or address`}</label>
          <styledEl.SearchField>
            <Search aria-hidden />
            <input
              id="mobile-orders-search"
              type="search"
              value={draftSearchTerm}
              placeholder={t`Token symbol or address`}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setDraftSearchTerm(event.target.value)}
            />
            {draftSearchTerm ? (
              <styledEl.ClearSearchButton
                type="button"
                aria-label={t`Clear search`}
                onClick={() => setDraftSearchTerm('')}
              >
                <X aria-hidden size={16} />
              </styledEl.ClearSearchButton>
            ) : null}
          </styledEl.SearchField>
        </styledEl.FilterGroup>
      </styledEl.FilterSheetBody>
    </BottomDrawer>
  )
}

function FilterSheetFooter({ canReset, filteredCount, onApply, onReset }: FilterSheetFooterProps): ReactNode {
  const { t } = useLingui()

  return (
    <styledEl.FilterActions>
      <styledEl.ResetButton type="button" disabled={!canReset} onClick={onReset}>
        {t`Reset filters`}
      </styledEl.ResetButton>
      <styledEl.ApplyButton onClick={onApply}>
        {filteredCount === 1 ? t`Show 1 order` : t`Show ${filteredCount} orders`}
      </styledEl.ApplyButton>
    </styledEl.FilterActions>
  )
}

function FilterStatusChoices({ value, onChange }: FilterStatusChoicesProps): ReactNode {
  const { t } = useLingui()
  const statusOptions = [
    { value: HistoryStatusFilter.ALL, label: t`All` },
    { value: HistoryStatusFilter.FILLED, label: t`Filled` },
    { value: HistoryStatusFilter.PARTIALLY_FILLED, label: t`Partially filled` },
    { value: HistoryStatusFilter.CANCELLED, label: t`Cancelled` },
    { value: HistoryStatusFilter.EXPIRED, label: t`Expired` },
  ] as const

  return (
    <styledEl.FilterGroup>
      <legend>{t`Status`}</legend>
      <styledEl.FilterChoices>
        {statusOptions.map((option) => (
          <styledEl.FilterChoice
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            $isSelected={value === option.value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </styledEl.FilterChoice>
        ))}
      </styledEl.FilterChoices>
    </styledEl.FilterGroup>
  )
}
