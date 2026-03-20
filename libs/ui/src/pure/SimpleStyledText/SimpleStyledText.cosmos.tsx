import { SimpleStyledText } from './SimpleStyledText.styled'

const SimpleStyledTextFixtures = {
  'SimpleStyledText paragraph': (
    <SimpleStyledText>
      <p>A single paragraph of text with consistent spacing.</p>
    </SimpleStyledText>
  ),
  'SimpleStyledText multiple paragraphs': (
    <SimpleStyledText>
      <p>First paragraph.</p>
      <p>Second paragraph with more content to show spacing between blocks.</p>
    </SimpleStyledText>
  ),
}

export default SimpleStyledTextFixtures
