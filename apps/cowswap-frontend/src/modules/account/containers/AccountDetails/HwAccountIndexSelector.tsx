import { useAtom } from 'jotai/index'
import { FormEvent, useCallback } from 'react'

import styled from 'styled-components/macro'

import { hwAccountIndexAtom } from 'modules/wallet/api/state'

const Wrapper = styled.form`
  font-size: 14px;
  margin: 10px 0;
`

const indexFieldName = 'index'

// TODO: add styles
export function HwAccountIndexSelector() {
  const [hwAccountIndex, setHwAccountIndex] = useAtom(hwAccountIndexAtom)

  const onHwAccountIndexChange = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()

      const formData = new FormData(event.target as HTMLFormElement)
      const index = +(formData.get(indexFieldName) || 0)

      setHwAccountIndex(index)
    },
    [setHwAccountIndex]
  )

  return (
    <Wrapper onSubmit={(event) => onHwAccountIndexChange(event)}>
      <p>Hardware account index:</p>
      <input name={indexFieldName} placeholder={hwAccountIndex.toString()} type="number" step={1} />
      <button>Update</button>
    </Wrapper>
  )
}
