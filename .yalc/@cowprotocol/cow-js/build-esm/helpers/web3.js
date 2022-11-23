import assert from 'assert';
import Web3 from 'web3';
// TODO: check if latest version fixes
import HttpProvider from 'web3-providers-http';
import WebsocketProvider from 'web3-providers-ws';
import Logger from './Logger';
export function createWeb3(url) {
    const log = new Logger('helpers:web3');
    const nodeUrl = url || process.env.NODE_URL;
    log.info('Connecting to ethereum using web3: %s', nodeUrl);
    assert(nodeUrl && /^(http|ws)s?:\/\/.+/.test(nodeUrl), 'url param, or NODE_URL env var must be a valid url');
    const provider = /^wss?:\/\/.*/.test(nodeUrl)
        ? new WebsocketProvider(nodeUrl, {
            timeout: 30000,
            // Enable auto reconnection
            reconnect: {
                auto: true,
                delay: 5000,
                onTimeout: true,
            },
        })
        : new HttpProvider(nodeUrl);
    return new Web3(provider);
}
//# sourceMappingURL=web3.js.map