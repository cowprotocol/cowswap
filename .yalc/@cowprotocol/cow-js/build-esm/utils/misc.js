import { AssertionError } from 'assert';
export function assert(val, message) {
    if (!val) {
        throw new AssertionError({ message });
    }
}
//# sourceMappingURL=misc.js.map