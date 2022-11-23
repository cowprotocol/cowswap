import chalk from "chalk";

export enum Align {
  Left,
  Right,
}

interface ColumnOptions {
  align?: Align;
  maxWidth?: number;
}

function cellText(text: string, size: number, align = Align.Left): string {
  let inner;
  if (text.length > size - 2) {
    inner = text.slice(0, size - 5) + "...";
  } else {
    if (align == Align.Right) {
      inner = text.padStart(size - 2, " ");
    } else {
      inner = text.padEnd(size - 2, " ");
    }
  }

  return " " + inner + " ";
}

// shrinks column sizes to fit the content
function columnWidths<Key extends string>(
  header: Record<Key, string>,
  entries: Record<Key, string>[],
  maxWidth: Partial<Record<Key, Pick<ColumnOptions, "maxWidth">>> = {},
): Record<Key, number> {
  const longestEntryLenght = (key: Key) =>
    entries.reduce((longest, entry) => Math.max(longest, entry[key].length), 0);
  const width: Partial<Record<Key, number>> = {};
  for (const key in header) {
    // pad with a space left and right (+2)
    width[key] =
      Math.min(
        Math.max(header[key].length, longestEntryLenght(key)),
        maxWidth[key]?.maxWidth === undefined
          ? Infinity
          : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            maxWidth[key]!.maxWidth!,
      ) + 2;
  }
  return width as Record<Key, number>;
}

export function displayTable<Key extends string>(
  header: Record<Key, string>,
  entries: Record<Key, string>[],
  order: Key[] | readonly Key[],
  keyOptions: Partial<Record<Key, ColumnOptions>> = {},
): void {
  const width = columnWidths(header, entries, keyOptions);
  console.log(
    order
      .map((key: Key) =>
        chalk.cyan(cellText(header[key], width[key], Align.Left)),
      )
      .join(chalk.gray("|")),
  );
  console.log(
    chalk.gray(order.map((key: Key) => "-".repeat(width[key])).join("+")),
  );
  for (const entry of entries) {
    console.log(
      order
        .map((key: Key) =>
          cellText(entry[key], width[key], keyOptions[key]?.align),
        )
        .join(chalk.gray("|")),
    );
  }
}
