import { SwapButton, SwapButtonProps } from '.'

function onClick() {
  console.log('Click!')
}

function Custom(props: SwapButtonProps) {
  return <SwapButton {...props}>🐮 Custom Swap Button</SwapButton>
}

const Fixtures = {
  swap: <Custom disabled={false} onClick={onClick} />,
  disabled: <Custom disabled={true} onClick={onClick} />,
}

export default Fixtures
