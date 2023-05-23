import { ApplicationState } from 'legacy/state/application/reducer'
import { localWarning } from 'legacy/state/application/localWarning'

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
