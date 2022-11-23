export declare class Logger {
    private _loggers;
    private _namespace;
    errorHandler: (formatter: any, ...args: any[]) => any;
    constructor(namespace: string);
    info(formatter: any, ...args: any[]): void;
    trace(formatter: any, ...args: any[]): void;
    debug(formatter: any, ...args: any[]): void;
    warn(formatter: any, ...args: any[]): void;
    error(formatter: any, ...args: any[]): void;
    _log(level: string, formatter: any, ...args: any[]): void;
    private _getLogger;
}
export default Logger;
//# sourceMappingURL=Logger.d.ts.map