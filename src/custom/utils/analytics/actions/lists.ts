import { Category } from '../types'
import { _reportEvent } from '../utils'

const types = {
  remove: {
    start: 'Start Remove List',
    confirm: 'Confirm Remove List',
  },
  update: {
    popup: 'Update List from Popup',
    select: 'Update List from List Select',
  },
  toggle: {
    enable: 'Enable List',
    disable: 'Disable List',
  },
  add: {
    success: 'Add List Success',
    failed: 'Add List Failed',
  },
}

type updateListType = keyof typeof types.update
export function updateListAnalytics(option: updateListType, listUrl: string) {
  _reportEvent({
    category: Category.LIST,
    action: types.update[option],
    label: listUrl,
  })
}

type removeListType = keyof typeof types.remove
export function removeListAnalytics(option: removeListType, listUrl: string) {
  _reportEvent({
    category: Category.LIST,
    action: types.remove[option],
    label: listUrl,
  })
}

type toggleListType = keyof typeof types.toggle
export function toggleListAnalytics(option: toggleListType, listUrl: string) {
  _reportEvent({
    category: Category.LIST,
    action: types.toggle[option],
    label: listUrl,
  })
}

type addListType = keyof typeof types.add
export function addListAnalytics(option: addListType, listURL: string) {
  _reportEvent({
    category: Category.LIST,
    action: types.add[option],
    label: listURL,
  })
}
