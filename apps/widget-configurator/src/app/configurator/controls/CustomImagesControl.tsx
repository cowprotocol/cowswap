import { ChangeEvent, Dispatch, SetStateAction, useCallback } from 'react'

import { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

import TextField from '@mui/material/TextField'

type CustomImages = CowSwapWidgetParams['images']

export interface CustomImagesControlProps {
  state: [CustomImages, Dispatch<SetStateAction<CustomImages>>]
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function CustomImagesControl({ state }: CustomImagesControlProps) {
  const [customImages, setCustomImages] = state

  const updateEmptyOrdersImage = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setCustomImages((prevState) => ({ ...prevState, emptyOrders: e.target.value || '' }))
    },
    [setCustomImages]
  )

  return (
    <div>
      <TextField
        fullWidth
        id="emptyOrdersImage"
        label="Empty orders image URL"
        value={customImages?.emptyOrders || ''}
        onChange={updateEmptyOrdersImage}
        size="small"
      />
    </div>
  )
}
