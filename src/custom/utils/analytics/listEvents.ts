import { Category, _reportEvent } from './index'

type UpdateListAction = 'Popup' | 'List Select'
export function updateListAnalytics(action: UpdateListAction, listUrl: string) {
  _reportEvent({
    category: Category.LIST,
    action: `Update List from ${action}`,
    label: listUrl,
  })
}

type RemoveListAction = 'Start' | 'Confirm'
export function removeListAnalytics(action: RemoveListAction, listUrl: string) {
  _reportEvent({
    category: Category.LIST,
    action: `${action} Remove List`,
    label: listUrl,
  })
}

export function toggleListAnalytics(enable: boolean, listUrl: string) {
  _reportEvent({
    category: Category.LIST,
    action: `${enable ? 'Enable' : 'Disable'} List`,
    label: listUrl,
  })
}

type AddListAction = 'Success' | 'Failed'
export function addListAnalytics(action: AddListAction, listURL: string) {
  _reportEvent({
    category: Category.LIST,
    action: `Add List ${action}`,
    label: listURL,
  })
}
