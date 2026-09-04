import { ReactNode } from 'react'

import { ArrowButton, PageButtonLink } from './OrdersTablePaginationButton.styled'

interface PageNavigationButtonProps {
  index: number
  ariaLabel: string
  getPageUrl?(index: number): Partial<{ pathname: string; search: string }>
  goToPage(index: number): void
  children: ReactNode
  active?: boolean
}

export function PageNavigationButton({
  index,
  ariaLabel,
  active = false,
  getPageUrl,
  goToPage,
  children,
}: PageNavigationButtonProps): ReactNode {
  return getPageUrl ? (
    <PageButtonLink
      to={getPageUrl(index)}
      $active={active}
      aria-current={active ? 'page' : undefined}
      aria-label={ariaLabel}
    >
      {children}
    </PageButtonLink>
  ) : (
    <ArrowButton
      type="button"
      onClick={() => goToPage(index)}
      $active={active}
      aria-current={active ? 'page' : undefined}
      aria-label={ariaLabel}
    >
      {children}
    </ArrowButton>
  )
}
