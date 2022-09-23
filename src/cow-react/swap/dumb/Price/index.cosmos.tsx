import { getTrade } from 'cow-react/common/mock'
import { Price, PriceProps } from './'

const defaultProps: PriceProps = {
  trade: getTrade(),
}

export default <Price {...defaultProps} />
