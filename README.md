# Splash Helper - Dink to Tasker Webhook Bridge

Forward RuneLite alerts from **Watchdog** → **Dink** → **Tasker** on your phone for AFK splashing monitoring.

## Overview

This Node.js/Express server bridges RuneLite notifications to your phone:

```
Watchdog Alert
    ↓
Dink Plugin (sends via custom webhook)
    ↓
This Server (processes & filters)
    ↓
Join by joaoapps
    ↓
Tasker on Android Phone
```

## Features

- ✅ Receives Dink webhook alerts
- ✅ Filters alerts by player account
- ✅ Filters by event type (deaths, levels, logins, etc.)
- ✅ Forwards to Tasker via Join by joaoapps
- ✅ Structured logging to file + console
- ✅ Cloud-agnostic deployment (Railway, Heroku, AWS, etc.)
- ✅ Request tracking with unique IDs

## Prerequisites

### On Your PC/RuneLite

1. **RuneLite Plugins installed:**
   - [Watchdog](https://github.com/adamk33n3r/runelite-watchdog) - Detects game events
   - [Dink](https://github.com/pajlads/DinkPlugin) - Sends webhooks

2. **Watchdog Setup:**
   - Create alert(s) for splashing events (e.g., low fire potion, player logout warnings)
   - Set the **Dink** action for alerts you want to receive on phone
   - Optional: Use capture groups to include dynamic values in messages

3. **Dink Setup:**
   - Install and configure Dink plugin
   - Set custom webhook URL to: `https://your-server-url/webhook/dink`
   - (You'll deploy this server and get the URL)

### On Your Phone

1. **Join by joaoapps** installed
2. Your Join API key (available in the app)
3. **Tasker** installed (optional, for automation)

### Environment

- Node.js 18+ or 20+
- npm or yarn

## Installation

### 1. Clone & Install

```bash
cd splash-helper-alerts
npm install
```

### 2. Configure Environment

```bash
# Copy example to .env
cp .env.example .env

# Edit with your values
# nano .env  (or use your editor)
```

**Required settings:**
- `JOIN_API_KEY` - Get from Join app: Settings → Devices → Click your device
- `JOIN_DEVICE_ID` - Usually `group.all` (sends to all devices)

**Optional settings:**
- `ACCOUNT_FILTER_ENABLED=true` + `ACCOUNT_FILTER_NAMES=YourChar,AltName` - Only alert for specific accounts
- `EVENT_FILTER=DEATH,LEVEL,LOGIN` - Only these event types (empty = all)
- `EVENT_EXCLUDE=LOGIN,LOGOUT` - Skip these event types

### 3. Run Locally

```bash
# Development (auto-restart on file changes)
npm run dev

# Production
npm start
```

Server starts on `http://localhost:3000`

**Health check:** `curl http://localhost:3000/health`

## Deployment

### Option 1: Railway (Recommended for Beginners)

1. Push code to GitHub
2. Go to [railway.app](https://railway.app)
3. New project → Deploy from GitHub
4. Connect your repo
5. Set environment variables (JOIN_API_KEY, etc.)
6. Railway generates a URL like `https://splash-helper-abc123.railway.app`

### Option 2: Heroku

```bash
# Install Heroku CLI, then:
heroku login
heroku create splash-helper-alerts
git push heroku main

# Set environment variables
heroku config:set JOIN_API_KEY=your_key
heroku config:set JOIN_DEVICE_ID=group.all

# View logs
heroku logs --tail
```

Your URL: `https://splash-helper-alerts.herokuapp.com`

### Option 3: AWS Lambda + API Gateway

See [AWS deployment guide](./DEPLOYMENT.md#aws-lambda)

### Option 4: Docker

```bash
docker build -t splash-helper .
docker run -e JOIN_API_KEY=your_key -p 3000:3000 splash-helper
```

## Configuration

### Dink Plugin Settings

In RuneLite's Dink plugin:
1. Go to Dink settings
2. Set **Webhook URL:** `https://your-deployed-url/webhook/dink`
3. Leave other settings as default

### Watchdog + Dink Integration

In Watchdog:
1. Create new alert for splashing event (e.g., "Low Fire Potion")
2. Add **Action → Dink**
3. Write message (can use capture groups like `$1` for dynamic values)
4. Save

When that alert triggers, Watchdog sends via Dink → your webhook → Tasker

## Event Types

Common events Dink sends:

```
DEATH              - Character died
LEVEL              - Skill level gained
LOGIN              - Character logged in
LOGOUT             - Character logged out
LOOT               - Item drop received
PET                - Pet obtained
SLAYER             - Slayer task related
KILL_COUNT         - Boss kill count
COLLECTION         - Collection log update
EXTERNAL_PLUGIN    - Custom plugin event (Watchdog)
```

See [Dink documentation](https://github.com/pajlads/DinkPlugin) for full list.

## Webhook Response Examples

### Success (200)

```json
{
  "success": true,
  "message": "Alert forwarded to Tasker",
  "alert": {
    "playerName": "YourCharacter",
    "eventType": "EXTERNAL_PLUGIN",
    "title": "YourCharacter - EXTERNAL_PLUGIN",
    "text": "Fire Potion running out soon!"
  }
}
```

### Filtered (200 - Skipped)

```json
{
  "skipped": true,
  "reason": "Alert filtered"
}
```

### Error (400/502)

```json
{
  "success": false,
  "error": "Failed to forward to Tasker",
  "message": "Invalid Join API key"
}
```

## Logs

Logs are written to `./logs/server.log` and console.

Format: `[ISO-TIMESTAMP] [LEVEL] [REQUEST-ID] message`

Check logs after alerts to verify they're being received:

```bash
tail -f logs/server.log
```

## Example Watchdog Setup for Splashing

**Alert 1: Low Fire Potion**
- Trigger: Game Message matching "Your fire potion has expired"
- Action: Dink with message "🔥 Fire potion expired!"

**Alert 2: AFK Too Long**
- Trigger: Stat Changed (Attack XP with condition: < 1 per 10 sec)
- Action: Dink with message "⏰ Attack XP dropping - might be AFK!"

**Alert 3: Player Logout**
- Trigger: Notification Fired (from built-in logout notification)
- Action: Dink with message "👤 Logged out"

## Troubleshooting

### Webhook not receiving alerts

1. **Verify Dink URL is correct**
   - Check Dink plugin settings → is webhook URL saved?
   - Test: `curl https://your-url/webhook/dink` (should return 200 with status: ready)

2. **Check server logs**
   ```bash
   npm run dev  # For local
   tail -f logs/server.log
   ```

3. **Test Dink plugin**
   - In Dink settings, click "Test Webhook" button
   - Should see request in server logs

### Notifications not reaching phone

1. **Verify Join API key**
   - Get fresh key from Join app
   - Test with: `curl -X POST https://joinjoaoapps.appspot.com/sendNotification -d "apikey=YOUR_KEY&deviceId=group.all&title=Test&text=Hello"`

2. **Check device ID**
   - `group.all` sends to all devices
   - Or use specific device ID from Join app

3. **Check Join app permissions**
   - Ensure Join app is not restricted by Android

### Server issues

```bash
# Check if running
curl http://localhost:3000/health

# View logs
tail -f logs/server.log

# Test webhook endpoint
curl -X POST http://localhost:3000/webhook/dink \
  -H "Content-Type: application/json" \
  -d '{"playerName":"Test","type":"EXTERNAL_PLUGIN","content":"Test alert"}'
```

## Testing

### Local Test

```bash
npm run dev

# In another terminal, send test alert
curl -X POST http://localhost:3000/webhook/dink \
  -H "Content-Type: application/json" \
  -d '{
    "playerName": "YourCharacter",
    "type": "EXTERNAL_PLUGIN",
    "content": "Test fire potion alert",
    "extra": {}
  }'
```

### Production Test

1. Configure your deployed URL in Dink settings
2. Trigger a Watchdog alert
3. Check phone for notification

## Development

```bash
# Run with auto-reload
npm run dev

# Run tests
npm test

# Check logs
tail -f logs/server.log
```

## Project Structure

```
├── src/
│   ├── server.js              # Express app main
│   ├── config.js              # Configuration
│   ├── logger.js              # Logging utility
│   ├── integrations/
│   │   └── join.js            # Join by joaoapps integration
│   ├── processors/
│   │   └── alertProcessor.js  # Alert filtering & formatting
│   └── routes/
│       ├── dink.js            # Dink webhook endpoint
│       └── health.js          # Health check
├── logs/
│   └── server.log             # Server logs
├── .env.example               # Environment template
├── package.json               # Dependencies
└── README.md                  # This file
```

## Performance

- **Latency:** ~100-300ms from Dink → Tasker (network dependent)
- **Rate limits:** Join by joaoapps allows ~60 requests/minute
- **Payload size:** Handles up to 50MB (Dink with screenshots)

## Security Notes

- Store `JOIN_API_KEY` in environment variables (never commit to git)
- Use HTTPS for all connections (production)
- Verify Dink webhook secret if configured
- Account filtering prevents alerts from other players

## License

MIT

## Support

- [RuneLite Watchdog](https://github.com/adamk33n3r/runelite-watchdog)
- [RuneLite Dink](https://github.com/pajlads/DinkPlugin)
- [Join by joaoapps](https://joaoapps.com/join/)
- [Tasker](https://tasker.joaoapps.com/)
