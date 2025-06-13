import { CancelButton, CancelButtonProps } from '.'

const props: CancelButtonProps = { onClick: () => alert('Button clicked!') }

const Fixtures = {
  default: () => <CancelButton {...props} />,
}

export default Fixtures
