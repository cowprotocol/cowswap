import { useAtom } from 'jotai/index'
import { FormEvent, useCallback, useRef } from 'react'

import styled from 'styled-components/macro'

import { hwAccountIndexAtom } from 'modules/wallet/api/state'

const Wrapper = styled.form`
  font-size: 14px;
  margin: 10px 0;
`

// TODO: add styles
export function HwAccountIndexSelector() {
  const accountIndexRef = useRef<HTMLInputElement>(null)
  const [hwAccountIndex, setHwAccountIndex] = useAtom(hwAccountIndexAtom)

  const onHwAccountIndexChange = useCallback(
    (event: FormEvent) => {
      event.preventDefault()

      setHwAccountIndex(+(accountIndexRef.current?.value || 0))
    },
    [setHwAccountIndex]
  )

  return (
    <Wrapper onSubmit={(event) => onHwAccountIndexChange(event)}>
      <p>Hardware account index:</p>
      <input ref={accountIndexRef} placeholder={hwAccountIndex.toString()} type="number" step={1} />
      <button>Update</button>
    </Wrapper>
  )
}
