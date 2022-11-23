import Logger from './Logger';
const log = new Logger('error');
/**
 * Log the error in case of an unhandled promise
 */
export function logUnhandledErrors() {
    process.on('unhandledRejection', error => {
        log.error('Uncaught promise rejection: ', error);
    });
}
//# sourceMappingURL=error.js.map