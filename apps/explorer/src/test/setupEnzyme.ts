// From https://github.com/cedrickchee/react-typescript-jest-enzyme-testing
// and https://github.com/airbnb/enzyme/issues/1284

import Enzyme from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

Enzyme.configure({ adapter: new Adapter() })
