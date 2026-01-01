# Notifications

## Local development

To debug/develop Telegram subscriptions locally you need to do:
1. Create your own telegram bot (https://core.telegram.org/bots/tutorial)
2. Put the bot id to `REACT_APP_TG_BOT_ID` in `.env.local`. You can get it from BotFather. Id is the fist digital part of API Token
3. Uncomment `REACT_APP_CMS_BASE_URL` in `.env.local` or add `REACT_APP_CMS_BASE_URL=http://localhost:1337/api` to `.env`
4. Run the CMS locally and add you bot API token to CMS `.env`: `TELEGRAM_SECRET=XXX`
5. In CMS settings, go to `Settings -> Users & Permissions plugin -> Roles -> Public -> Telegram subscription` and enable `addSubscription`, `removeSubscription`, and `checkSubscription`
6. Launch CoW Swap app as `pnpm run start --host=127.0.0.1`, because Telegram only allows using this domain locally

