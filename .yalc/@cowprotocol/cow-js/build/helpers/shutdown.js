"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shutDown = exports.onShutdown = void 0;
const tslib_1 = require("tslib");
const Logger_1 = tslib_1.__importDefault(require("./Logger"));
const POSIX_SIGNALS = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
const log = new Logger_1.default('helpers:shutdown');
const listeners = [];
let isRunning = true;
POSIX_SIGNALS.forEach(signal => {
    process.on(signal, () => {
        _doShutDown(`I've gotten a ${signal} signal`);
    });
});
function onShutdown(listener) {
    log.debug('Registering a new listener');
    listeners.push(listener);
}
exports.onShutdown = onShutdown;
function shutDown(reason) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        if (!isRunning) {
            return;
        }
        isRunning = false;
        const reasonPrefix = reason ? reason + ': ' : '';
        log.debug(reasonPrefix + 'Closing gracefully...');
        // Wait for all shutdown listeners
        yield Promise.all(listeners.map(listener => {
            return listener();
        }));
    });
}
exports.shutDown = shutDown;
function _doShutDown(reason) {
    function _doExit(returnCode) {
        log.debug('The app is ready to shutdown! Goodbye! :)');
        process.exit(returnCode);
    }
    shutDown(reason)
        .then(() => {
        _doExit(0);
    })
        .catch(error => {
        log.error({
            msg: 'Error while shutting down the app: ' + error.toString(),
            error,
        });
        _doExit(2);
    });
}
//# sourceMappingURL=shutdown.js.map