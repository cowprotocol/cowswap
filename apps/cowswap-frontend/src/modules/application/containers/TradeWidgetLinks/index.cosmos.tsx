import { Widget } from 'modules/application/pure/Widget'

import { TradeWidgetLinks, BadgeType } from '.';


type BadgeInfo = {
  text: string;
  type: BadgeType;
}

const BADGES: BadgeInfo[] = [
  { text: 'BETA', type: 'default' },
  { text: 'NEW!', type: 'success' },
  { text: 'ALPHA', type: 'alert' },
  { text: 'NEW!', type: 'alert2' },
  { text: 'RELEASE', type: 'information' },
];

type Fixtures = {
  [key: string]: React.FunctionComponent;
};

const BadgeFixtures = BADGES.reduce<Fixtures>((fixtures, badge) => {
  const Fixture = () => (
    <Widget>
      <TradeWidgetLinks
        highlightedBadgeText={badge.text}
        highlightedBadgeType={badge.type}
      />
    </Widget>
  );

  // Set the badge text as the key for the Fixture in the fixtures object
  fixtures[`Badge - ${badge.text} (${badge.type})`] = Fixture;
  return fixtures;
}, {});

export default BadgeFixtures;
