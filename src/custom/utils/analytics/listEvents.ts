import { Category, reportEvent } from './index'

type UpdateListLocation = 'Popup' | 'List Select'
export function updateListAnalytics(location: UpdateListLocation, listUrl: string) {
  reportEvent({
    category: Category.LIST,
    action: `Update List from ${location}`,
    label: listUrl,
  })
}

type RemoveListAction = 'Start' | 'Confirm'
export function removeListAnalytics(action: RemoveListAction, listUrl: string) {
  reportEvent({
    category: Category.LIST,
    action: `${action} Remove List`,
    label: listUrl,
  })
}

export function toggleListAnalytics(enable: boolean, listUrl: string) {
  reportEvent({
    category: Category.LIST,
    action: `${enable ? 'Enable' : 'Disable'} List`,
    label: listUrl,
  })
}

type AddListAction = 'Success' | 'Failed'
export function addListAnalytics(action: AddListAction, listURL: string) {
  reportEvent({
    category: Category.LIST,
    action: `Add List ${action}`,
    label: listURL,
  })
}
