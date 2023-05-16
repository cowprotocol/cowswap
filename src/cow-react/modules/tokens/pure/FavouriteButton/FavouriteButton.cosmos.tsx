import { FavouriteButton } from './FavouriteButton'

const Fixtures = {
  'is favourite': <FavouriteButton isFavourite onClick={() => {}} />,
  'is not favourite': <FavouriteButton isFavourite={false} onClick={() => {}} />,
}
export default Fixtures
