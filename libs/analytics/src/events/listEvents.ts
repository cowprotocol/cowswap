import { sendEvent } from '../googleAnalytics'
import { Category } from '../types'

type UpdateListLocation = 'Popup' | 'List Select'
export function updateListAnalytics(location: UpdateListLocation, listUrl: string) {
  sendEvent({
    category: Category.LIST,
    action: `Update List from ${location}`,
    label: listUrl,
  })
}

type RemoveListAction = 'Start' | 'Confirm'
export function removeListAnalytics(action: RemoveListAction, listUrl: string) {
  sendEvent({
    category: Category.LIST,
    action: `${action} Remove List`,
    label: listUrl,
  })
}

export function toggleListAnalytics(enable: boolean, listUrl: string) {
  sendEvent({
    category: Category.LIST,
    action: `${enable ? 'Enable' : 'Disable'} List`,
    label: listUrl,
  })
}

type AddListAction = 'Success' | 'Failed'
export function addListAnalytics(action: AddListAction, listURL: string) {
  sendEvent({
    category: Category.LIST,
    action: `Add List ${action}`,
    label: listURL,
  })
}
