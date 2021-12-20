import styled from 'styled-components/macro'
import { darken } from 'polished'
import OptionMod, { OptionCardClickable as OptionCardClickableMod, OptionProps } from './OptionMod'

export * from './OptionMod'

const OptionCardClickable = styled(OptionCardClickableMod)`
  background-color: ${({ theme, active }) => (active ? theme.primary1 : darken(0.06, theme.bg1))};
`

export default function Option(props: Omit<OptionProps, 'OptionCardClickable'>) {
  return <OptionMod {...props} OptionCardClickable={OptionCardClickable} />
}
