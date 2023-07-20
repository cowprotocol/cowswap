import { Atom, atom, useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

interface NotificationState {
  isClosed: boolean
}

type NotificationStorageKey = `notification-${string}`

const storage = {
  getItem: (key: string) => {
    return JSON.parse(localStorage.getItem(key) || '')
  },

  setItem: (key: string, value: NotificationState) => {
    localStorage.setItem(key, JSON.stringify(value))
  },

  removeItem: localStorage.removeItem,

  subscribe: (key: string, callback: (value: NotificationState) => void) => {
    const storageEventCallback = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        callback(JSON.parse(e.newValue))
      }
    }
    window.addEventListener('storage', storageEventCallback)
    return () => {
      window.removeEventListener('storage', storageEventCallback)
    }
  },
}

function getNotificationStorageKey(key: string): NotificationStorageKey {
  return `notification-${key}`
}

const INITIAL_NOTIFICATION_STATE: NotificationState = {
  isClosed: false,
}

const notificationStateAtoms = new Map<string, Atom<NotificationState>>()
const untrackedAtom = atom(() => INITIAL_NOTIFICATION_STATE)

function getNotificationStateAtom(key: string | undefined) {
  if (typeof key !== 'string') {
    return untrackedAtom
  }

  const existingAtom = notificationStateAtoms.get(key)

  if (existingAtom) {
    return existingAtom
  } else {
    const atom = atomWithStorage<NotificationState>(getNotificationStorageKey(key), INITIAL_NOTIFICATION_STATE, storage)
    notificationStateAtoms.set(key, atom)

    return atom
  }
}

// TODO: replace any
export function useNotificationState(key: string | undefined): [NotificationState, (state: NotificationState) => void] {
  const [notificationState, setNotificationState] = useAtom(getNotificationStateAtom(key))

  if (typeof key === 'string') {
    return [notificationState, setNotificationState]
  }

  // A noop function to avoid breaking the hook when the key is undefined.
  const NOOP_READ = () => notificationState

  return [notificationState, NOOP_READ]
}
