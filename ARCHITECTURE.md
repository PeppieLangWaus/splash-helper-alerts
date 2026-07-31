# Architecture

## Data Flow

```
Watchdog Plugin (RuneLite)
    ↓
    └─→ Detects: Low potions, AFK, deaths, level-ups, etc.
    
Dink Plugin (RuneLite)
    ↓
    └─→ Receives alert from Watchdog
    └─→ POSTs to custom webhook URL
    
Your Webhook Server (this repo)
    ↓ (receives JSON payload)
    └─→ Parse Dink payload
    └─→ Check filters (account, event type)
    └─→ Format for Tasker
    └─→ Send via Join API
    
Join by joaoapps (Android)
    ↓
    └─→ Receives notification
    └─→ Shows in notification tray
    
Tasker (Android, optional)
    ↓
    └─→ Can trigger automations
    └─→ AutoTouch, screen control, etc.
```

## Component Architecture

```
┌─────────────────────────────────────────────────┐
│         Express Server (src/server.js)          │
│ Handles routing, middleware, error handling     │
└────────┬──────────────────────────────┬─────────┘
         │                              │
    ┌────▼────────┐           ┌─────────▼─────┐
    │   Routes    │           │   Middleware  │
    │ - /health   │           │ - Logging     │
    │ - /webhook  │           │ - JSON parser │
    └────┬────────┘           └───────────────┘
         │
    ┌────▼──────────────────────────────────┐
    │     Dink Webhook Handler (routes/)    │
    │ POST /webhook/dink endpoint           │
    └────┬─────────────────────────────────┘
         │
    ┌────▼──────────────────────────────────┐
    │  Alert Processor (processors/)        │
    │ - shouldProcessAlert()  [filtering]   │
    │ - processAlert()        [parsing]     │
    │ - buildNotification()   [formatting]  │
    └────┬─────────────────────────────────┘
         │
    ┌────▼──────────────────────────────────┐
    │  Join Integration (integrations/)     │
    │ - sendNotification()  [HTTP to Join]  │
    │ - formatNotification() [for Tasker]   │
    └────┬─────────────────────────────────┘
         │
    ┌────▼──────────────────────────────────┐
    │   axios HTTP Client                   │
    │   → https://joinjoaoapps.appspot.com  │
    └─────────────────────────────────────┘
         │
    ┌────▼──────────────────────────────────┐
    │   User's Android Phone                │
    │   - Join receives notification        │
    │   - Shows in tray                     │
    │   - Tasker can react (optional)       │
    └─────────────────────────────────────┘
```

## File Structure

```
splash-helper-alerts/
├── src/                           # Application source code
│   ├── server.js                  # Express app entry point
│   ├── config.js                  # Configuration management
│   ├── logger.js                  # Logging utility
│   ├── integrations/
│   │   └── join.js                # Join by joaoapps client
│   ├── processors/
│   │   └── alertProcessor.js      # Alert filtering & formatting
│   └── routes/
│       ├── dink.js                # Dink webhook endpoint
│       └── health.js              # Health check endpoint
│
├── logs/                          # Runtime logs (git-ignored)
│   └── server.log                 # Server logs
│
├── config/                        # Configuration files (reserved)
│
├── .env.example                   # Environment template
├── .env                           # Your actual config (git-ignored)
├── .gitignore                     # Git ignore rules
│
├── package.json                   # Dependencies & scripts
├── Dockerfile                     # Docker image definition
├── docker-compose.yml             # Docker Compose orchestration
│
├── setup.sh                       # Setup script (macOS/Linux)
├── setup.bat                      # Setup script (Windows)
│
├── README.md                      # Full documentation
├── QUICKSTART.md                  # 5-minute setup guide
├── DEPLOYMENT.md                  # Cloud deployment guides
├── EXAMPLES.md                    # Payload examples & testing
├── CHANGELOG.md                   # Version history
├── ARCHITECTURE.md                # This file
│
└── .git/                          # Git repository

```

## Processing Pipeline

### Request Lifecycle

```
1. HTTP Request arrives at POST /webhook/dink
   ├─ Generate request ID (UUID)
   ├─ Parse JSON body
   └─ Log incoming alert

2. Validate Payload
   ├─ Check required fields (playerName, type)
   └─ Return 400 if invalid

3. Filter Alert (shouldProcessAlert)
   ├─ Account whitelist check
   ├─ Event type filter check
   ├─ Event type exclusion check
   └─ Return 200/{skipped: true} if filtered

4. Process Alert (processAlert)
   ├─ Extract player name, event type, message
   ├─ Parse extra metadata
   └─ Build structured alert object

5. Build Notification (buildNotification)
   ├─ Format title: [EventType] PlayerName
   ├─ Add message body
   ├─ Add relevant metadata (deaths, levels, etc.)
   └─ Truncate to 500 chars for mobile

6. Send to Join (sendNotification)
   ├─ Build Join API payload
   ├─ HTTP POST to Join API
   ├─ Handle errors with retries
   └─ Return response

7. Return Result
   ├─ 200 with success details ✓
   ├─ 200 with skipped reason (filtered) ⏭️
   ├─ 502 if Join fails ✗
   └─ 500 for other errors 💥
```

## Configuration Flow

```
.env file
   │
   ├─→ config.js (reads env vars)
   │
   ├─→ server.js (uses config)
   │
   ├─→ routes/ (uses config)
   │
   ├─→ processors/ (uses config for filters)
   │
   └─→ integrations/ (uses config for Join API)
```

## Environment Variables → Runtime

```
JOIN_API_KEY
   └─→ config.join.apiKey
       └─→ used in integrations/join.js
           └─→ sendNotification()
               └─→ Added to axios POST payload
                   └─→ Sent to Join API

ACCOUNT_FILTER_ENABLED + ACCOUNT_FILTER_NAMES
   └─→ config.accounts.filtering
       └─→ used in processors/alertProcessor.js
           └─→ shouldProcessAlert()
               └─→ Checks playerName against whitelist
                   └─→ Returns false if not whitelisted
                       └─→ Alert is filtered out (not sent)

EVENT_FILTER + EVENT_EXCLUDE
   └─→ config.alerts
       └─→ used in processors/alertProcessor.js
           └─→ shouldProcessAlert()
               └─→ Checks event type against filters
                   └─→ Returns false if filtered/excluded
                       └─→ Alert is skipped
```

## Deployment Architecture

### Local Development
```
Your Machine
└─ npm run dev
   └─ localhost:3000
      └─ Used by ngrok or port-forwarding
         └─ Exposed as public URL for Dink
```

### Cloud Deployment (Railway Example)
```
Railway Platform
├─ Git webhook trigger
├─ Auto build from GitHub
├─ Deploy to container
├─ Assign public URL (*.railway.app)
├─ Set environment variables
└─ Auto restart on crash
   └─ Receives Dink webhooks
      └─ Sends to Join/Tasker
```

### Self-Hosted (Docker on VPS)
```
Your VPS
├─ Clone repo
├─ docker-compose up
├─ Container runs Node app
├─ Port 3000 mapped (or behind Nginx)
├─ Persistent logs volume
└─ Manual restart needed
   └─ Receives Dink webhooks
      └─ Sends to Join/Tasker
```

## Error Handling

```
User sends alert via Dink
   │
   ├─ Invalid JSON?
   │  └─ 400 Bad Request
   │
   ├─ Missing playerName/type?
   │  └─ 400 Missing required fields
   │
   ├─ Filtered by config?
   │  └─ 200 {skipped: true}
   │
   ├─ Join API key missing?
   │  └─ 500 error logged
   │
   ├─ Join API returns error?
   │  └─ 502 Bad Gateway
   │     Log error for debugging
   │
   └─ Success?
      └─ 200 {success: true}
         Alert forwarded to phone
```

## Security Considerations

**What this server does:**
- ✓ Validates Dink payloads
- ✓ Filters alerts by player account
- ✓ Logs all activity
- ✓ Runs on HTTPS (when deployed)
- ✓ Secures Join API key in environment

**What you should do:**
- ✓ Never commit .env file
- ✓ Use strong Join API key
- ✓ Deploy to HTTPS URL
- ✓ Keep server URL private (don't share with others)
- ✓ Monitor logs for suspicious activity
- ✓ Use account filtering if multi-player account

**Known Limitations:**
- No authentication on webhook (assumes Dink URL is private)
- No rate limiting (reliant on Join's 60req/min limit)
- No alert persistence (stateless design)
- Screenshots not forwarded to Tasker

---

For more details, see README.md and DEPLOYMENT.md
