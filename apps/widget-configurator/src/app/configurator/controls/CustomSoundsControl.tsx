import { ChangeEvent, Dispatch, SetStateAction, useCallback } from 'react'

import { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

import TextField from '@mui/material/TextField'

type CustomSounds = CowSwapWidgetParams['sounds']
type WidgetSounds = keyof NonNullable<CowSwapWidgetParams['sounds']>

export interface CustomSoundsControlProps {
  state: [CustomSounds, Dispatch<SetStateAction<CustomSounds>>]
}

export function CustomSoundsControl({ state }: CustomSoundsControlProps) {
  const [customSound, setCustomSounds] = state

  const updateSoundCallback = useCallback(
    (type: WidgetSounds) => {
      return (e: ChangeEvent<HTMLInputElement>) => {
        setCustomSounds((prevState) => ({ ...prevState, [type]: e.target.value || '' }))
      }
    },
    [setCustomSounds]
  )

  return (
    <div>
      <TextField
        fullWidth
        margin="dense"
        id="postOrderSound"
        label="Submitted order sound URL"
        value={customSound?.postOrder || ''}
        onChange={updateSoundCallback('postOrder')}
        size="small"
      />
      <TextField
        fullWidth
        margin="dense"
        id="orderExecutedSound"
        label="Executed order sound URL"
        value={customSound?.orderExecuted || ''}
        onChange={updateSoundCallback('orderExecuted')}
        size="small"
      />
      <TextField
        fullWidth
        margin="dense"
        id="orderErrorSound"
        label="Failed order sound URL"
        value={customSound?.orderError || ''}
        onChange={updateSoundCallback('orderError')}
        size="small"
      />
    </div>
  )
}
