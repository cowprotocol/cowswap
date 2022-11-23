"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWeb3 = void 0;
const tslib_1 = require("tslib");
const assert_1 = tslib_1.__importDefault(require("assert"));
const web3_1 = tslib_1.__importDefault(require("web3"));
// TODO: check if latest version fixes
const web3_providers_http_1 = tslib_1.__importDefault(require("web3-providers-http"));
const web3_providers_ws_1 = tslib_1.__importDefault(require("web3-providers-ws"));
const Logger_1 = tslib_1.__importDefault(require("./Logger"));
function createWeb3(url) {
    const log = new Logger_1.default('helpers:web3');
    const nodeUrl = url || process.env.NODE_URL;
    log.info('Connecting to ethereum using web3: %s', nodeUrl);
    assert_1.default(nodeUrl && /^(http|ws)s?:\/\/.+/.test(nodeUrl), 'url param, or NODE_URL env var must be a valid url');
    const provider = /^wss?:\/\/.*/.test(nodeUrl)
        ? new web3_providers_ws_1.default(nodeUrl, {
            timeout: 30000,
            // Enable auto reconnection
            reconnect: {
                auto: true,
                delay: 5000,
                onTimeout: true,
            },
        })
        : new web3_providers_http_1.default(nodeUrl);
    return new web3_1.default(provider);
}
exports.createWeb3 = createWeb3;
//# sourceMappingURL=web3.js.map