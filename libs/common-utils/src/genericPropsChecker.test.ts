import { genericPropsChecker } from './genericPropsChecker'

describe('genericPropsChecker() to check component props via React.memo', () => {
  it('Must return false, when props are functions with different references', () => {
    const result = genericPropsChecker(
      {
        foo() {
          console.log('***')
        },
      },
      {
        foo() {
          console.log('***')
        },
      }
    )

    expect(result).toBe(false)
  })

  it('Must return true, when props are functions with the same reference', () => {
    // TODO: Add proper return type annotation
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    const func = function () {
      console.log('***')
    }
    const result = genericPropsChecker({ func }, { func })

    expect(result).toBe(true)
  })

  describe('When props are objects', () => {
    describe('Must compare them deeply using recursion', () => {
      it('And return true, when objects are equal', () => {
        const result = genericPropsChecker(
          { options: { foo: { bar: 1 } } }, //
          { options: { foo: { bar: 1 } } } //
        )

        expect(result).toBe(true)
      })

      it('And return false, when objects are NOT equal', () => {
        // bar - are not the same function (different references)
        const result = genericPropsChecker(
          { options: { foo: { bar: () => 1 } } },
          { options: { foo: { bar: () => 1 } } }
        )

        expect(result).toBe(false)
      })
    })
  })
})
