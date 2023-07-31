import { CancelButton, CancelButtonProps } from './index'

const props: CancelButtonProps = { onClick: () => alert('Button clicked!') }

const Fixtures = {
  default: <CancelButton {...props} />,
}

export default Fixtures
