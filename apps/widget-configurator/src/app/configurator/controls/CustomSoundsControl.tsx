import { ChangeEvent, Dispatch, SetStateAction, useCallback } from 'react'

import { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

import TextField from '@mui/material/TextField'

type CustomSounds = CowSwapWidgetParams['sounds']
type WidgetSounds = keyof NonNullable<CowSwapWidgetParams['sounds']>

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const valueNullAsString = (value: string | undefined | null) => (value === null ? 'null' : value || '')

export interface CustomSoundsControlProps {
  state: [CustomSounds, Dispatch<SetStateAction<CustomSounds>>]
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function CustomSoundsControl({ state }: CustomSoundsControlProps) {
  const [customSound, setCustomSounds] = state

  const updateSoundCallback = useCallback(
    (type: WidgetSounds) => {
      return (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setCustomSounds((prevState) => ({ ...prevState, [type]: value === 'null' ? null : value || '' }))
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
        value={valueNullAsString(customSound?.postOrder)}
        onChange={updateSoundCallback('postOrder')}
        size="small"
      />
      <TextField
        fullWidth
        margin="dense"
        id="orderExecutedSound"
        label="Executed order sound URL"
        value={valueNullAsString(customSound?.orderExecuted)}
        onChange={updateSoundCallback('orderExecuted')}
        size="small"
      />
      <TextField
        fullWidth
        margin="dense"
        id="orderErrorSound"
        label="Failed order sound URL"
        value={valueNullAsString(customSound?.orderError)}
        onChange={updateSoundCallback('orderError')}
        size="small"
      />
    </div>
  )
}
