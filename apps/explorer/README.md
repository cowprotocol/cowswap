# CoW Protocol Explorer

Allows you to explore the protocol orders and trades.

## 🏃‍♀️ Run it locally

```bash
yarn start:explorer
```


## 👷‍♀️ Build app

```bash
yarn build:explorer
```

Static files will be generated inside the `build/explorer` dir.

## 🧪 Run tests

```bash
yarn test:explorer
```

## Orderbook API Endpoints

Fee quote requests and posting orders are sent to the Orderbook API. This API has the responsibility of collecting orders and
handing them to the solvers.

The reference implementation of the API is [CoW Protocol Services](https://github.com/cowprotocol/services).

The API endpoint is configured using the environment variable `REACT_APP_ORDER_BOOK_URLS`:

```ini
REACT_APP_ORDER_BOOK_URLS={"1":"https://YOUR_HOST","100":"https://YOUR_HOST","5":"https://YOUR_HOST"}
```
