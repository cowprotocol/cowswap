import { ReactNode } from 'react'

import { ArrowButton, PageButtonLink } from './OrdersTablePaginationButton.styled'

interface PageNavigationButtonProps {
  index: number
  getPageUrl?(index: number): Partial<{ pathname: string; search: string }>
  goToPage(index: number): void
  children: ReactNode
  active?: boolean
}

export function PageNavigationButton({
  index,
  active = false,
  getPageUrl,
  goToPage,
  children,
}: PageNavigationButtonProps): ReactNode {
  return getPageUrl ? (
    <PageButtonLink to={getPageUrl(index)} $active={active}>
      {children}
    </PageButtonLink>
  ) : (
    <ArrowButton onClick={() => goToPage(index)} $active={active}>
      {children}
    </ArrowButton>
  )
}
