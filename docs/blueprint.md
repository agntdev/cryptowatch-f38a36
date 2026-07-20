# CryptoWatch Bot — Bot specification

**Archetype:** custom

**Voice:** professional and concise — write every user-facing message, button label, error, and empty state in this voice.

A Telegram bot that watches crypto prices and pings you when something moves. Each person keeps their own private watchlist and sets alerts for price thresholds or percentage moves. Supports on-demand checks, a morning summary, quiet hours, and cooldown to avoid spam.

> This is the complete contract for the bot. Implement EVERY entry point, flow, feature, integration, and edge case below. The completeness review checks the bot against this document after each build pass.

## Primary audience

- crypto traders
- crypto enthusiasts

## Success criteria

- user can add coins to their watchlist
- user receives price alerts when thresholds are met
- user can set quiet hours to avoid notifications during sleep
- user can view a morning summary of price changes
- user can check on-demand prices for any coin in their watchlist

## Entry points

Every feature must be reachable from the bot's command/button surface (button-first; only /start and /help are slash commands).

- **/start** (command, actor: user, command: /start) — Open the main menu and see a brief intro
- **Add BTC** (button, actor: user, callback: add:BTC) — Add Bitcoin to the watchlist
  - outputs: watchlist item
- **Add ETH** (button, actor: user, callback: add:ETH) — Add Ethereum to the watchlist
  - outputs: watchlist item
- **Add TON** (button, actor: user, callback: add:TON) — Add TON to the watchlist
  - outputs: watchlist item
- **Add custom coin** (button, actor: user, callback: add:custom) — Add a custom coin to the watchlist
  - inputs: ticker
  - outputs: watchlist item
- **Check price** (button, actor: user, callback: price:all) — Check prices for all coins in the watchlist
  - outputs: quote
- **Settings** (button, actor: user, callback: settings) — View current settings
  - outputs: settings
- **Help** (button, actor: user, callback: help) — View help information
  - outputs: help

## Flows

### add coin
_Trigger:_ /add <ticker> or inline button

1. user enters /add <ticker> or presses inline button
2. bot checks if coin exists
3. bot adds coin to user's watchlist
4. bot confirms addition

_Data touched:_ watchlist item

### remove coin
_Trigger:_ /remove <ticker>

1. user enters /remove <ticker>
2. bot checks if coin exists in watchlist
3. bot removes coin from watchlist
4. bot confirms removal

_Data touched:_ watchlist item

### check price
_Trigger:_ /price <ticker> or /price

1. user enters /price <ticker> or /price
2. bot fetches price from price feed
3. bot displays price for coin(s)
4. bot shows price change if available

_Data touched:_ quote

### set alert
_Trigger:_ /alert <ticker> <price> or /alert <ticker> <percent>%

1. user enters /alert <ticker> <price> or /alert <ticker> <percent>%
2. bot validates input
3. bot sets alert in user's settings
4. bot confirms alert setup

_Data touched:_ alert

### set summary time
_Trigger:_ /summary <HH:MM>

1. user enters /summary <HH:MM>
2. bot validates time format
3. bot sets summary time in user's settings
4. bot confirms summary time setup

_Data touched:_ user

### set quiet hours
_Trigger:_ /quiet <start> <end>

1. user enters /quiet <start> <end>
2. bot validates time format
3. bot sets quiet hours in user's settings
4. bot confirms quiet hours setup

_Data touched:_ user

### set cooldown
_Trigger:_ /cooldown <minutes>

1. user enters /cooldown <minutes>
2. bot validates input
3. bot sets cooldown duration in user's settings
4. bot confirms cooldown setup

_Data touched:_ user

### view settings
_Trigger:_ /settings

1. user enters /settings
2. bot displays user's current settings

_Data touched:_ user

### owner view
_Trigger:_ /owner

1. owner enters /owner
2. bot displays total users and top alerts

_Data touched:_ user, alert

### morning summary
_Trigger:_ scheduled event at user's summary time

1. bot checks if it's within quiet hours
2. bot fetches prices for all coins in user's watchlist
3. bot calculates price changes
4. bot sends summary to user

_Data touched:_ quote, user

### alert check
_Trigger:_ scheduled event every 5 minutes

1. bot checks if it's within quiet hours
2. bot fetches prices for all coins in user's watchlist
3. bot checks if any alerts are triggered
4. bot sends alert to user if triggered

_Data touched:_ quote, alert, user

## Data entities

Durable data (must survive a restart) uses the toolkit's persistent store, never in-memory maps.

- **user** _(retention: persistent)_ — Telegram user with their own watchlist, alert settings, quiet hours, cooldown state, and summary preferences
  - fields: user_id, watchlist, alerts, quiet_hours_start, quiet_hours_end, cooldown_duration, summary_time, last_alert_time
- **watchlist item** _(retention: persistent)_ — A coin ticker with optional threshold and percentage move alert
  - fields: ticker, threshold, percent_threshold
- **alert** _(retention: none)_ — A triggered condition with coin, old/new price, and percent change
  - fields: coin, old_price, new_price, percent_change, triggered_at
- **quote** _(retention: none)_ — A price snapshot for a coin
  - fields: ticker, price, timestamp

## Integrations

- **Telegram** (required) — Bot API messaging
- **CoinGecko API** (required) — Price feed
Call external APIs against their real contract (correct endpoints, ids, params); credentials from env. Do not fake responses.

## Owner controls

- view total users
- view top alerts

## Notifications

- price alerts
- morning summary

## Permissions & privacy

- each user's watchlist and settings private
- owner-only /owner command
- user data stored in SQLite
- price feed data not stored permanently

## Edge cases

- unknown ticker
- price feed failure
- quiet hours during alert check
- cooldown period during alert check
- invalid input for commands
- time format errors
- price feed API rate limits

## Required tests

- add coin to watchlist
- remove coin from watchlist
- check price for coin
- set price threshold alert
- set percentage move alert
- set summary time
- set quiet hours
- set cooldown duration
- view settings
- morning summary
- alert check
- owner view

## Assumptions

- price feed: CoinGecko API
- cooldown duration: 30 minutes
- quiet hours: 22:00 to 08:00
- summary time: 08:00
- alert types: price threshold and percentage move
- error handling: retry price feed failures quietly
- unknown tickers: helpful reply with suggestions
- privacy: each user's watchlist and settings private
- owner view: owner-only /owner command
