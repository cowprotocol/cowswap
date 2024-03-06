export interface OrdersTablePageParams {
  tabId: string
  pageNumber: number
}

export enum TabOrderTypes {
  LIMIT = 'limit',
  ADVANCED = 'advanced',
}
