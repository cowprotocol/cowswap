// `trade-form` is PrimaryWrapper's container name.
export const TWAP_FIELD_ROW_CLASS = 'twap-form-field-row'

// If the trade form is less than this, TWAP settings fields stay in a single column.
export const TWAP_FIELD_ROW_STACK_MAX_WIDTH = '370px'

// stylis 3 drops the component selector inside `@container`, so this rule is plain CSS.
export const twapFieldRowStackCss = `
@container trade-form (max-width: ${TWAP_FIELD_ROW_STACK_MAX_WIDTH}) {
  .${TWAP_FIELD_ROW_CLASS}.${TWAP_FIELD_ROW_CLASS} {
    flex-direction: column;
    grid-gap: 6px;
  }
}
`
