type Props = {
  atCurrency: string | null
  perCurrency: string | null
}

export function HeadingText({ atCurrency, perCurrency }: Props) {
  if (!atCurrency || !perCurrency) {
    return <span>Select input and output</span>
  }

  return (
    <span>
      At <strong>{atCurrency}</strong> per <strong>{perCurrency}</strong>
    </span>
  )
}
