import { debug } from 'debug';
export class Logger {
    constructor(namespace) {
        this._loggers = {};
        this._namespace = namespace;
        this.errorHandler = this.error.bind(this);
    }
    info(formatter, ...args) {
        this._log('INFO', formatter, ...args);
    }
    trace(formatter, ...args) {
        this._log('TRACE', formatter, ...args);
    }
    debug(formatter, ...args) {
        this._log('DEBUG', formatter, ...args);
    }
    warn(formatter, ...args) {
        this._log('WARN', formatter, ...args);
    }
    error(formatter, ...args) {
        this._log('ERROR', formatter, ...args);
    }
    _log(level, formatter, ...args) {
        const logger = this._getLogger(level, this._namespace);
        logger(formatter, ...args);
    }
    _getLogger(logLevel, namespace) {
        const loggerName = logLevel + '-' + namespace;
        let logger = this._loggers[loggerName];
        if (!logger) {
            logger = debug(loggerName);
            // Use STDOUT for non error messages
            let consoleFn;
            if (logLevel === 'DEBUG') {
                consoleFn = 'debug';
            }
            else if (logLevel === 'INFO') {
                consoleFn = 'info';
            }
            else if (logLevel === 'WARN') {
                consoleFn = 'warn';
            }
            if (consoleFn) {
                // Set the console logger function (to use STDOUT)
                // Note that by default is console.error
                logger.log = console[consoleFn].bind(console);
            }
            this._loggers[namespace] = logger;
        }
        return logger;
    }
}
export default Logger;
//# sourceMappingURL=Logger.js.map