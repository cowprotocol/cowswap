import { localWarning } from './localWarning'
import { ApplicationState } from './reducer'

const popupList: ApplicationState['popupList'] = []

if (localWarning) {
  popupList.push({
    key: 'localWarning',
    show: true,
    removeAfterMs: null,
    content: {
      warning: localWarning,
    },
  })
}

export const initialState: ApplicationState = { chainId: null, openModal: null, popupList }
