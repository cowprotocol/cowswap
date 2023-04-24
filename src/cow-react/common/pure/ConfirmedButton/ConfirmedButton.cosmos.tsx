import { ConfirmedButton } from './ConfirmedButton'

const Fixtures = {
  default: (
    <ConfirmedButton onConfirm={() => alert('confirmed!')} action="do stuff">
      Turn on something
    </ConfirmedButton>
  ),
}

export default Fixtures
