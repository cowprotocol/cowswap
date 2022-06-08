import { ApplicationState } from '@src/state/application/reducer'
import { localWarning } from 'components/Header/URLWarning/localWarning'

const popupList: ApplicationState['popupList'] = []

if (localWarning) {
  popupList.push({
    key: 'missingPinataEnvVars',
    show: true,
    removeAfterMs: null,
    content: { message: localWarning },
  })
}

export const initialState: ApplicationState = { chainId: null, openModal: null, popupList }
