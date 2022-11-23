"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logUnhandledErrors = void 0;
const tslib_1 = require("tslib");
const Logger_1 = tslib_1.__importDefault(require("./Logger"));
const log = new Logger_1.default('error');
/**
 * Log the error in case of an unhandled promise
 */
function logUnhandledErrors() {
    process.on('unhandledRejection', error => {
        log.error('Uncaught promise rejection: ', error);
    });
}
exports.logUnhandledErrors = logUnhandledErrors;
//# sourceMappingURL=error.js.map