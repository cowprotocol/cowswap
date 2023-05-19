import { ApplicationState } from 'state/application/reducer'
import { localWarning } from 'state/application/localWarning'

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
