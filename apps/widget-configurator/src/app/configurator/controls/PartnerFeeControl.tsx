import { ChangeEvent, Dispatch, SetStateAction, useCallback } from 'react'

import TextField from '@mui/material/TextField'

export interface PartnerFeeControlProps {
  feeBpsState: [number, Dispatch<SetStateAction<number>>]
}
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function PartnerFeeControl(props: PartnerFeeControlProps) {
  const { feeBpsState } = props
  const [feeBps, setFeeBps] = feeBpsState

  const onFeeBpsChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = Math.ceil(Number(e.target.value || 0))

      setFeeBps(value)
    },
    [setFeeBps]
  )

  return (
    <>
      <TextField
        id="partnerFeePercent"
        label="Partner fee BPS"
        value={feeBps}
        onChange={onFeeBpsChange}
        type="number"
        size="small"
        inputProps={{
          min: 0,
          max: 100,
          step: 1,
        }}
      />
    </>
  )
}
