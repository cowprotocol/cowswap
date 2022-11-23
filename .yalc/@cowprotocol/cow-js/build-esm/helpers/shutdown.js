import { __awaiter } from "tslib";
import Logger from './Logger';
const POSIX_SIGNALS = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
const log = new Logger('helpers:shutdown');
const listeners = [];
let isRunning = true;
POSIX_SIGNALS.forEach(signal => {
    process.on(signal, () => {
        _doShutDown(`I've gotten a ${signal} signal`);
    });
});
export function onShutdown(listener) {
    log.debug('Registering a new listener');
    listeners.push(listener);
}
export function shutDown(reason) {
    return __awaiter(this, void 0, void 0, function* () {
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